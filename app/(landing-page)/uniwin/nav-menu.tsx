"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { TableProperties } from "lucide-react"

const vehicleComponents: {
  title: string
  href: string
  description: string
}[] = [
  {
    title: "All Vehicles",
    href: "/uniwin",
    description: "A table of all vehicles that have been logged into UniWin",
  },
  {
    title: "Scrap Vehicles",
    href: "/uniwin",
    description: "Set vehicles as scrapped",
  },
]

const fileComponents: { title: string; href: string; description: string }[] = [
  {
    title: "Materials",
    href: "/uniwin/materials",
    description: "A table of all materials that can be modified",
  },
  {
    title: "Customers",
    href: "/uniwin/customers",
    description: "A table of all customers that can be modified",
  },
]

export function NavMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Reports</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <TableProperties className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      UniWin Smart Reports
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      View and modify data within UniWin
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="/uniwin/reconcile-bank"
                title="Reconcile Trading Acc"
              >
                Reconcile payments that have been made via trading account
              </ListItem>
              <ListItem
                href="/uniwin/tradingacc-pay"
                title="Trading Acc Pay"
              >
                Print and pay all BACS payments and update the method to Trading
                Acc
              </ListItem>
              <ListItem
                href="/uniwin/bacs-pay"
                title="BACS Pay"
              >
                Print and pay all BACS payments and generate CSV file then mark
                paid
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Vehicles</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {vehicleComponents.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Files</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {fileComponents.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            href="/docs"
            legacyBehavior
            passHref
          >
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
