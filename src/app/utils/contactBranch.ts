import type { Contact, ContactBranch, ContactCreatePayload } from "@/app/types/contact"

type ContactLike = Partial<Contact & ContactCreatePayload>

export function hasContactAddress(contact: ContactLike): boolean {
  return !!(
    contact.address_line_1 ||
    contact.address_line_2 ||
    contact.address_line_3 ||
    contact.address_line_4 ||
    contact.city ||
    contact.county_state ||
    contact.postal_code ||
    contact.country_id
  )
}

export function buildInitialBranchPayload(contact: ContactLike): Omit<ContactBranch, "id"> {
  return {
    name: "Main Branch",

    contact_person: null,
    email: contact.email ?? null,
    phone: contact.phone ?? null,

    is_collection: true,
    is_delivery: true,

    delivery_address_line_1: contact.address_line_1 ?? null,
    delivery_address_line_2: contact.address_line_2 ?? null,
    delivery_address_line_3: contact.address_line_3 ?? contact.address_line_4 ?? null,
    delivery_city: contact.city ?? null,
    delivery_county_state: contact.county_state ?? null,
    delivery_postal_code: contact.postal_code ?? null,
    delivery_country_id: contact.country_id ?? null,

    billing_same_as_delivery: true,

    billing_address_line_1: contact.address_line_1 ?? null,
    billing_address_line_2: contact.address_line_2 ?? null,
    billing_address_line_3: contact.address_line_3 ?? contact.address_line_4 ?? null,
    billing_city: contact.city ?? null,
    billing_county_state: contact.county_state ?? null,
    billing_postal_code: contact.postal_code ?? null,
    billing_country_id: contact.country_id ?? null,
  }
}
