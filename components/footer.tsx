import Link from "next/link";
import { Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tighter text-foreground">
                HQ<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Premium streetwear for those who dare to stand out. Quality pieces that define your style.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=tshirts"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=hoodies"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Hoodies
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=pants"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pants
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} HQ Streetwear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
