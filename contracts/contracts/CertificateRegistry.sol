/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertificateRegistry
 * @notice MVP: ERC-721 certificate registry with issuer-based minting and revocation.
 *         Token metadata is stored as a URI string (typically ipfs://CID) and a metadataHash (keccak256).
 *
 * Roles:
 * - DEFAULT_ADMIN_ROLE: manage ISSUER_ROLE
 * - ISSUER_ROLE: mint certificates
 *
 * Revocation:
 * - Only the original issuer of a token can revoke it (and must still have ISSUER_ROLE).
 */
contract CertificateRegistry is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct CertificateInfo {
        address issuer;
        bytes32 metadataHash;
        string tokenURI_;
        uint64 issuedAt;
        bool revoked;
    }

    uint256 private _tokenIdTracker;
    mapping(uint256 => CertificateInfo) private _certs;

    event Minted(
        uint256 indexed tokenId,
        address indexed to,
        address indexed issuer,
        string tokenURI,
        bytes32 metadataHash
    );

    event Revoked(
        uint256 indexed tokenId,
        address indexed issuer,
        uint64 revokedAt
    );

    constructor(address admin) ERC721("HCMUT Certificate", "HCMUTCERT") {
        require(admin != address(0), "Invalid admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // -------- Access control management --------

    function addIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, account);
    }

    function removeIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ISSUER_ROLE, account);
    }

    // -------- Mint certificate --------

    function mintCertificate(
        address to,
        string calldata tokenURI_,
        bytes32 metadataHash
    ) external onlyRole(ISSUER_ROLE) returns (uint256 tokenId) {
        require(to != address(0), "Invalid recipient");
        require(metadataHash != bytes32(0), "Empty hash");
        require(bytes(tokenURI_).length != 0, "Empty URI");

        tokenId = ++_tokenIdTracker;
        _safeMint(to, tokenId);

        _certs[tokenId] = CertificateInfo({
            issuer: msg.sender,
            metadataHash: metadataHash,
            tokenURI_: tokenURI_,
            issuedAt: uint64(block.timestamp),
            revoked: false
        });

        emit Minted(tokenId, to, msg.sender, tokenURI_, metadataHash);
    }

    // -------- Revoke --------

    function revoke(uint256 tokenId) external {
        _requireOwned(tokenId);

        CertificateInfo storage info = _certs[tokenId];
        require(hasRole(ISSUER_ROLE, msg.sender), "Not issuer role");
        require(msg.sender == info.issuer, "Only original issuer");
        require(!info.revoked, "Already revoked");

        info.revoked = true;
        emit Revoked(tokenId, msg.sender, uint64(block.timestamp));
    }

    // -------- Views --------

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _certs[tokenId].tokenURI_;
    }

    function getCertificate(uint256 tokenId)
        external
        view
        returns (
            address issuer,
            bytes32 metadataHash,
            string memory uri,
            uint64 issuedAt,
            bool revoked
        )
    {
        _requireOwned(tokenId);
        CertificateInfo memory c = _certs[tokenId];
        return (c.issuer, c.metadataHash, c.tokenURI_, c.issuedAt, c.revoked);
    }

    // -------- Required overrides --------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}