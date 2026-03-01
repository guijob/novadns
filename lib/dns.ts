/**
 * Route53 DNS helper
 *
 * Env vars required:
 *   R53_ACCESS_KEY_ID      — IAM user with route53:ChangeResourceRecordSets + route53:ListResourceRecordSets
 *   R53_SECRET_ACCESS_KEY
 *   R53_REGION             — use "us-east-1" (Route53 is global but the API endpoint is us-east-1)
 *   ROUTE53_HOSTED_ZONE_ID — e.g. "Z1D633PJN98FT9" (from the AWS console)
 *   BASE_DOMAIN            — e.g. "novadns.io"
 */

import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ChangeAction,
  RRType,
} from "@aws-sdk/client-route-53"

function client() {
  return new Route53Client({
    region: process.env.R53_REGION ?? "us-east-1",
    credentials: {
      accessKeyId:     process.env.R53_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R53_SECRET_ACCESS_KEY!,
    },
  })
}

function fqdn(subdomain: string) {
  const domain = process.env.BASE_DOMAIN ?? "novadns.io"
  return `${subdomain}.${domain}.` // Route53 expects trailing dot
}

/** Upsert (create or update) an A or AAAA record. */
export async function upsertDnsRecord(
  subdomain: string,
  type: "A" | "AAAA",
  value: string,
  ttl: number,
): Promise<void> {
  if (!process.env.ROUTE53_HOSTED_ZONE_ID) return // not configured — skip silently


  try {
    await client().send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID,
      ChangeBatch: {
        Changes: [{
          Action: ChangeAction.UPSERT,
          ResourceRecordSet: {
            Name: fqdn(subdomain),
            Type: type as RRType,
            TTL:  ttl,
            ResourceRecords: [{ Value: value }],
          },
        }],
      },
    }))
  } catch (err) {
    console.error("[dns] upsertDnsRecord failed", err)
  }
}

/** Delete an A or AAAA record. Requires the current value to match. */
export async function deleteDnsRecord(
  subdomain: string,
  type: "A" | "AAAA",
  value: string,
  ttl: number,
): Promise<void> {
  if (!process.env.ROUTE53_HOSTED_ZONE_ID) return

  try {
    await client().send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID,
      ChangeBatch: {
        Changes: [{
          Action: ChangeAction.DELETE,
          ResourceRecordSet: {
            Name: fqdn(subdomain),
            Type: type as RRType,
            TTL:  ttl,
            ResourceRecords: [{ Value: value }],
          },
        }],
      },
    }))
  } catch (err) {
    // Record may not exist — not a fatal error
    console.error("[dns] deleteDnsRecord failed", err)
  }
}
