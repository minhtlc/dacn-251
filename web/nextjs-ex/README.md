# CertifyChain - Blockchain Certificate Verification

A modern Next.js landing page for a blockchain-backed certificate verification system. This project was created by transforming a Figma Make design into a fully functional Next.js application.

## 🚀 Features

- **Homepage**: Beautiful landing page with hero section, features, and call-to-action
- **Certificate Verification**: Search and verify certificates by serial number
- **Verification Results**: Detailed views for valid and revoked certificates
- **Student Dashboard**: Personal dashboard for managing certificates
- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## 📦 Installation

The project is already set up! Just run:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Color Palette**: Custom color variables using OKLCH color space
- **Typography**: Inter font family with consistent sizing
- **Components**: Reusable UI components following shadcn/ui patterns
- **Dark Mode**: Full dark mode support (can be enabled in the future)

## 📁 Project Structure

```
nextjs-ex/
├── app/
│   ├── globals.css          # Global styles and design tokens
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main application page
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── Footer.tsx            # Footer with links
│   ├── Homepage.tsx          # Landing page content
│   ├── VerificationSearch.tsx    # Certificate search
│   ├── VerificationValid.tsx     # Valid certificate view
│   ├── VerificationRevoked.tsx   # Revoked certificate view
│   ├── StudentDashboard.tsx      # Student dashboard
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── separator.tsx
└── lib/
    └── utils.ts              # Utility functions

```

## 🎯 Pages & Navigation

The application includes several main views:

1. **Home** - Landing page with features and CTAs
2. **Verify Certificate** - Search for certificates
3. **Verification Results** - Valid or revoked status
4. **Student Dashboard** - Personal certificate management
5. **About** - Information about CertifyChain

## 🎨 Customization

### Colors

All colors are defined in `app/globals.css` using CSS custom properties. You can easily customize the color scheme by modifying the `:root` variables.

### Components

UI components are located in `components/ui/` and can be customized or extended as needed.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

This Next.js application can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- Any Node.js hosting platform

## 📄 License

This project uses components from [shadcn/ui](https://ui.shadcn.com/) under the MIT license.

## 🙏 Acknowledgments

- Design generated with Figma Make
- UI components from shadcn/ui
- Icons from Lucide React
- Fonts from Google Fonts

---

Built with ❤️ using Next.js and Tailwind CSS
