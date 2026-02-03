/**
 * =================
 * List Contacts
 * =================
 *
 * Fetch paginated contacts, optionally filtered by contact_type.
 */

import http from "@/api/http";
import contactTransformer from "@/app/transformers/contact";
import type { Contact, PaginatedResponse } from "@/app/types/contact";
import type { ContactType } from "@/app/types/contact-type";

export interface ListContactsParams {
  page?: number;
  per_page?: number;
  contact_type?: ContactType; // ✅ now comes from contact-type
  status?: string;
}

export default async function listContacts(
  params: ListContactsParams = {}
): Promise<PaginatedResponse<Contact>> {
  const response = await http.get("/contacts", { params });

  return {
    ...response.data,
    data: contactTransformer.fetchCollection(response.data.data),
  };
}
