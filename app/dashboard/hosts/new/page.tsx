import Link from "next/link"
import { createHost } from "@/lib/actions"
import { buttonVariants } from "@/components/ui/button-variants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Server action form-compatible wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createHostAction = createHost as any

export default function NewHostPage() {
  const base = process.env.BASE_DOMAIN ?? "novadns.io"

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add host</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new dynamic DNS entry</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Host details</CardTitle>
          <CardDescription>Your device will be reachable at subdomain.{base}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createHostAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="subdomain">Subdomain</FieldLabel>
                <div className="flex items-center gap-1">
                  <Input id="subdomain" name="subdomain" placeholder="home" required className="flex-1" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.{base}</span>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="description">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </FieldLabel>
                <Textarea id="description" name="description" placeholder="Home router, office server…" rows={2} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ttl">TTL (seconds)</FieldLabel>
                <Input id="ttl" name="ttl" type="number" defaultValue={60} min={30} max={86400} />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Create host</Button>
                <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
                  Cancel
                </Link>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
