import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/pos")({
  component: POS
})

import { Banknote, ChevronDown, CreditCard, Minus, Plus, Search, Smartphone, Trash2, UserCircle2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

// ─────────────────────────────────────────────────────────────
// Mocked "API" data
// ─────────────────────────────────────────────────────────────

interface Product {
  id: number
  name: string
  sku: string
  category: string
  price: number
  stock: number
  image: string
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    category: "Apparel",
    sku: "APL-001",
    price: 299,
    stock: 42,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop"
  },
  {
    id: 2,
    name: "Slim Fit Denim Jeans",
    category: "Apparel",
    sku: "APL-002",
    price: 1299,
    stock: 18,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop"
  },
  {
    id: 3,
    name: "Graphic Hoodie",
    category: "Apparel",
    sku: "APL-003",
    price: 899,
    stock: 27,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop"
  },
  {
    id: 4,
    name: "Running Sneakers",
    category: "Footwear",
    sku: "FTW-001",
    price: 2499,
    stock: 10,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop"
  },
  {
    id: 5,
    name: "Leather Loafers",
    category: "Footwear",
    sku: "FTW-002",
    price: 3199,
    stock: 8,
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=80&h=80&fit=crop"
  },
  {
    id: 6,
    name: "Canvas Tote Bag",
    category: "Accessories",
    sku: "ACC-001",
    price: 499,
    stock: 55,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=80&h=80&fit=crop"
  },
  {
    id: 7,
    name: "Aviator Sunglasses",
    category: "Accessories",
    sku: "ACC-002",
    price: 749,
    stock: 30,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop"
  },
  {
    id: 8,
    name: "Leather Wallet",
    category: "Accessories",
    sku: "ACC-003",
    price: 599,
    stock: 22,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&h=80&fit=crop"
  },
  {
    id: 9,
    name: "Stainless Steel Water Bottle",
    category: "Lifestyle",
    sku: "LFT-001",
    price: 399,
    stock: 60,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=80&h=80&fit=crop"
  },
  {
    id: 10,
    name: "Wireless Earbuds",
    category: "Electronics",
    sku: "ELC-001",
    price: 1999,
    stock: 14,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop"
  },
  {
    id: 11,
    name: "Phone Case (Universal)",
    category: "Electronics",
    sku: "ELC-002",
    price: 249,
    stock: 80,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=80&h=80&fit=crop"
  },
  {
    id: 12,
    name: "Scented Soy Candle",
    category: "Lifestyle",
    sku: "LFT-002",
    price: 349,
    stock: 35,
    image: "https://images.unsplash.com/photo-1603905756009-9d027eb18b82?w=80&h=80&fit=crop"
  },
  {
    id: 13,
    name: "Yoga Mat",
    category: "Sports",
    sku: "SPT-001",
    price: 899,
    stock: 20,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=80&h=80&fit=crop"
  },
  {
    id: 14,
    name: "Resistance Bands Set",
    category: "Sports",
    sku: "SPT-002",
    price: 549,
    stock: 33,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=80&h=80&fit=crop"
  },
  {
    id: 15,
    name: "Ceramic Coffee Mug",
    category: "Lifestyle",
    sku: "LFT-003",
    price: 199,
    stock: 70,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=80&h=80&fit=crop"
  }
]

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  creditBalance: number
}

const CUSTOMERS: Customer[] = [
  { id: 1, name: "Arjun Sharma", phone: "9876543210", email: "arjun@example.com", creditBalance: 1200 },
  { id: 2, name: "Priya Nair", phone: "9845012345", email: "priya@example.com", creditBalance: 0 },
  { id: 3, name: "Rohan Mehta", phone: "9900112233", email: "rohan@example.com", creditBalance: 4500 },
  { id: 4, name: "Sunita Verma", phone: "9123456789", email: "sunita@example.com", creditBalance: 0 },
  { id: 5, name: "Karthik Iyer", phone: "9012345678", email: "karthik@example.com", creditBalance: 800 },
  { id: 6, name: "Deepa Krishnan", phone: "8899001122", email: "deepa@example.com", creditBalance: 0 },
  { id: 7, name: "Mohammed Rafiq", phone: "9988776655", email: "mrafiq@example.com", creditBalance: 2300 },
  { id: 8, name: "Anjali Gupta", phone: "7700112244", email: "anjali@example.com", creditBalance: 0 }
]

const WALK_IN: Customer = { id: 0, name: "Walk-in Customer", phone: "", email: "", creditBalance: 0 }

type PaymentMode = "cash" | "upi" | "credit"
type Step = 0 | 1

interface CartLine {
  product: Product
  qty: number
}

// ─────────────────────────────────────────────────────────────
// Step Accordion — mirrors original Checkout pattern exactly
// ─────────────────────────────────────────────────────────────

const STEP_LABELS = ["Customer Information", "Payment"] as const

function StepSection({
  index,
  activeStep,
  setActiveStep,
  children
}: {
  index: Step
  activeStep: Step
  setActiveStep: (s: Step) => void
  children: React.ReactNode
}) {
  const isActive = activeStep === index
  const isCompleted = activeStep > index

  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground">
      <button
        type="button"
        disabled={!isCompleted}
        onClick={() => isCompleted && setActiveStep(index)}
        className="flex w-full items-center justify-between px-5 py-4 text-left disabled:cursor-default"
      >
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-semibold text-xs",
              isActive || isCompleted
                ? "bg-primary text-primary-foreground"
                : "border-2 border-muted-foreground/30 text-muted-foreground"
            ].join(" ")}
          >
            {isCompleted ? "✓" : index + 1}
          </span>
          <span
            className={[
              "font-semibold text-sm",
              isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
            ].join(" ")}
          >
            {STEP_LABELS[index]}
          </span>
        </div>
        {isCompleted && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {isActive && <div className="border-t px-5 pt-4 pb-5">{children}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Cart Item Row — mirrors original Checkout CartItemRow exactly
// ─────────────────────────────────────────────────────────────

function CartItemRow({
  line,
  onChange,
  onRemove
}: {
  line: CartLine
  onChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
}) {
  const { product, qty } = line
  return (
    <div className="flex gap-3 py-4">
      {/* Product image with quantity badge — same as original */}
      <div className="relative flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          loading="lazy"
          className="h-20 w-20 rounded-lg bg-muted object-cover"
        />
        <Badge variant="secondary" className="-right-2 -top-2 absolute h-5 w-5 justify-center rounded-full p-0 text-xs">
          {qty}
        </Badge>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground text-sm leading-snug">{product.name}</p>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-muted-foreground text-xs">
          <span>{product.category}</span>
          <span>{product.sku}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6"
            aria-label="Decrease quantity"
            onClick={() => (qty === 1 ? onRemove(product.id) : onChange(product.id, qty - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-5 text-center text-sm tabular-nums">{qty}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6"
            aria-label="Increase quantity"
            onClick={() => onChange(product.id, Math.min(qty + 1, product.stock))}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-1 h-6 w-6 text-muted-foreground hover:text-destructive"
            aria-label="Remove item"
            onClick={() => onRemove(product.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Line total */}
      <span className="flex-shrink-0 font-semibold text-foreground text-sm tabular-nums">
        ₹{(product.price * qty).toLocaleString("en-IN")}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main POS Component
// ─────────────────────────────────────────────────────────────

function POS() {
  const [activeStep, setActiveStep] = useState<Step>(0)

  // Customer
  const [customerOpen, setCustomerOpen] = useState(false)
  const [customer, setCustomer] = useState<Customer>(WALK_IN)

  // Items
  const [cart, setCart] = useState<CartLine[]>([])
  const [itemSearch, setItemSearch] = useState("")
  const [itemOpen, setItemOpen] = useState(false)
  const [coupon, setCoupon] = useState("")

  // Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash")
  const [cashTendered, setCashTendered] = useState("")
  const [upiRef, setUpiRef] = useState("")
  const [note, setNote] = useState("")

  // Derived
  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0)
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax
  const change = paymentMode === "cash" ? Math.max(0, Number(cashTendered) - total) : 0

  const filteredProducts = useMemo(() => {
    const q = itemSearch.toLowerCase()
    if (!q) return PRODUCTS.slice(0, 8)
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }, [itemSearch])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing)
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: Math.min(l.qty + 1, product.stock) } : l))
      return [...prev, { product, qty: 1 }]
    })
    setItemSearch("")
    setItemOpen(false)
  }

  const updateQty = (id: number, qty: number) => setCart((p) => p.map((l) => (l.product.id === id ? { ...l, qty } : l)))
  const removeItem = (id: number) => setCart((p) => p.filter((l) => l.product.id !== id))

  const handlePlaceOrder = () => {
    toast.success(
      `Order placed!\nCustomer: ${customer.name}\nTotal: ₹${total.toLocaleString("en-IN")}\nPayment: ${paymentMode.toUpperCase()}`
    )
    setCart([])
    setCustomer(WALK_IN)
    setCashTendered("")
    setUpiRef("")
    setNote("")
    setActiveStep(0)
  }

  return (
    <div className="h-full bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-bold text-2xl">Point of Sale</h1>
          <p className="mt-1 text-muted-foreground text-sm">Create a new sale transaction</p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_420px]">
          {/* ══════════════════════════════════════
              LEFT — Customer Info + Payment Steps
          ══════════════════════════════════════ */}
          <div className="space-y-3">
            {/* Step 0 — Customer Information */}
            <StepSection index={0} activeStep={activeStep} setActiveStep={setActiveStep}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Customer</Label>
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger
                      render={
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal" />
                      }
                    >
                      <div className="flex items-center gap-2 truncate">
                        <UserCircle2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{customer.name}</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search customer…" />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="walk-in"
                              onSelect={() => {
                                setCustomer(WALK_IN)
                                setCustomerOpen(false)
                              }}
                            >
                              <UserCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">Walk-in Customer</p>
                                <p className="text-muted-foreground text-xs">No account</p>
                              </div>
                            </CommandItem>
                            <Separator className="my-1" />
                            {CUSTOMERS.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.name}
                                onSelect={() => {
                                  setCustomer(c)
                                  setCustomerOpen(false)
                                }}
                              >
                                <UserCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm">{c.name}</p>
                                  <p className="text-muted-foreground text-xs">{c.phone}</p>
                                </div>
                                {c.creditBalance > 0 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    Due ₹{c.creditBalance.toLocaleString("en-IN")}
                                  </Badge>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Customer detail card — only when a named customer is selected */}
                {customer.id !== 0 && (
                  <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{customer.email}</span>
                    </div>
                    {customer.creditBalance > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Outstanding Due</span>
                          <span className="font-semibold text-destructive">
                            ₹{customer.creditBalance.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Button className="w-full" onClick={() => setActiveStep(1)}>
                  Continue
                </Button>
              </div>
            </StepSection>

            {/* Step 1 — Payment */}
            <StepSection index={1} activeStep={activeStep} setActiveStep={setActiveStep}>
              <div className="space-y-4">
                {/* Payment mode selector — 3 cards */}
                <div className="space-y-2">
                  <Label>Mode of Payment</Label>
                  <div className="flex gap-2">
                    {(
                      [
                        { mode: "cash", label: "Cash", Icon: Banknote },
                        { mode: "upi", label: "UPI", Icon: Smartphone },
                        { mode: "credit", label: "On Credit", Icon: CreditCard }
                      ] as const
                    ).map(({ mode, label, Icon }) => (
                      <button
                        key={mode}
                        type="button"
                        disabled={mode === "credit" && customer.id === 0}
                        onClick={() => setPaymentMode(mode)}
                        className={[
                          "flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-2 py-3 font-medium text-xs transition-colors",
                          paymentMode === mode
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                          mode === "credit" && customer.id === 0 ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  {customer.id === 0 && (
                    <p className="text-muted-foreground text-xs">Select a customer to enable On Credit.</p>
                  )}
                </div>

                {/* Cash tendered */}
                {paymentMode === "cash" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="cash-tendered">Cash Tendered (₹)</Label>
                    <Input
                      id="cash-tendered"
                      type="number"
                      min={0}
                      placeholder={total.toString()}
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                    />
                    {Number(cashTendered) > 0 && (
                      <div className="flex justify-between rounded-md bg-muted px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Change</span>
                        <span className="font-semibold tabular-nums">₹{change.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* UPI ref */}
                {paymentMode === "upi" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="upi-ref">UPI Reference / UTR</Label>
                    <Input
                      id="upi-ref"
                      placeholder="e.g. 324567890123"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                    />
                  </div>
                )}

                {/* Credit warning */}
                {paymentMode === "credit" && (
                  <div className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive text-xs">
                    <p className="font-semibold">Adding to credit account</p>
                    <p>
                      New outstanding balance:{" "}
                      <span className="font-bold">₹{(customer.creditBalance + total).toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                )}

                {/* Note */}
                <div className="space-y-1.5">
                  <Label htmlFor="note">Order Note (optional)</Label>
                  <textarea
                    id="note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Gift wrap, special instructions…"
                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handlePlaceOrder}>
                  {paymentMode === "credit" ? "Save as Due" : `Collect Payment · ₹${total.toLocaleString("en-IN")}`}
                </Button>
              </div>
            </StepSection>
          </div>

          {/* ══════════════════════════════════════
              RIGHT — Item Search + Cart (mirrors
              original checkout's order summary)
          ══════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-8">
            <div className="rounded-xl border bg-muted/40 p-6">
              <h2 className="mb-4 font-semibold text-base">Items</h2>

              {/* Search to add */}
              <Popover open={itemOpen} onOpenChange={setItemOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="mb-2 w-full justify-start gap-2 bg-background font-normal text-muted-foreground"
                    />
                  }
                >
                  <Search className="h-4 w-4" />
                  Search by name or SKU…
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
                  <Command>
                    <CommandInput
                      placeholder="Search by name or SKU…"
                      value={itemSearch}
                      onValueChange={setItemSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup heading="Products">
                        {filteredProducts.map((p) => {
                          const inCart = cart.find((l) => l.product.id === p.id)
                          return (
                            <CommandItem
                              key={p.id}
                              value={`${p.name} ${p.sku}`}
                              disabled={p.stock === 0}
                              onSelect={() => addToCart(p)}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-sm">{p.name}</span>
                                <span className="ml-2 text-muted-foreground text-xs">{p.sku}</span>
                              </div>
                              <div className="flex flex-shrink-0 items-center gap-2">
                                {inCart && (
                                  <Badge variant="secondary" className="text-xs">
                                    {inCart.qty} in cart
                                  </Badge>
                                )}
                                <span className="font-semibold text-sm tabular-nums">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                                {p.stock === 0 && <span className="text-muted-foreground text-xs">Out of stock</span>}
                                {p.stock > 0 && p.stock <= 5 && (
                                  <span className="text-destructive text-xs">{p.stock} left</span>
                                )}
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Cart lines — same style as original Checkout */}
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
                  <Search className="mb-2 h-7 w-7 opacity-30" />
                  <p className="text-sm">No items added yet</p>
                  <p className="mt-1 text-xs opacity-70">Search above to add products</p>
                </div>
              ) : (
                <div className="divide-y">
                  {cart.map((line) => (
                    <CartItemRow key={line.product.id} line={line} onChange={updateQty} onRemove={removeItem} />
                  ))}
                </div>
              )}

              {/* Coupon */}
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="bg-background"
                />
                <Button variant="outline" className="flex-shrink-0">
                  Apply
                </Button>
              </div>

              {/* Totals — same layout as original Checkout */}
              <div className="mt-5 space-y-2.5">
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-medium tabular-nums">₹{tax.toLocaleString("en-IN")}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="tabular-nums">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
