import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useContactStore } from "@/app/stores/contact";
import type { Contact, ContactType } from "@/app/types/contact";

const HEADER_LABELS: Record<ContactType, string> = {
  customer: "Customers",
  supplier: "Suppliers",
  road_haulier: "Road Hauliers",
  airline: "Airlines",
  rail_operator: "Rail Operators",
  shipping_line: "Shipping Lines",
};

const TYPE_LABELS: Record<ContactType, string> = {
  customer: "Customer",
  supplier: "Supplier",
  road_haulier: "Road Haulier",
  airline: "Airline",
  rail_operator: "Rail Operator",
  shipping_line: "Shipping Line",
};

export function useContactsPage() {
  const store = useContactStore();
  const route = useRoute();
  const router = useRouter();
  const confirm = useConfirm();

  const search = ref("");

  const contactType = computed(() => route.meta.contactType as ContactType);
  const headerTitle = computed(() => HEADER_LABELS[contactType.value] ?? "Contacts");

  watchEffect(async () => {
    if (!contactType.value) return;
    await store.setType(contactType.value);
  });

  const filteredItems = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return store.items;

    return store.items.filter((c) => {
      const p0 = c.people?.[0];
      const typesText = (c.contact_types ?? []).join(" ");
      return (
        (c.address ?? "").toLowerCase().includes(q) ||
        (c.country ?? "").toLowerCase().includes(q) ||
        (c.eori ?? "").toLowerCase().includes(q) ||
        typesText.toLowerCase().includes(q) ||
        (p0?.name ?? "").toLowerCase().includes(q) ||
        (p0?.email ?? "").toLowerCase().includes(q) ||
        (p0?.phone ?? "").toLowerCase().includes(q)
      );
    });
  });

  function prettyType(type: ContactType) {
    return TYPE_LABELS[type] ?? type;
  }

  function prettyTypeList(types: ContactType[]) {
    if (!types?.length) return "—";
    return types.map((t) => prettyType(t)).join(", ");
  }

  function primaryPerson(contact: Contact) {
    const p = contact.people?.[0];
    return {
      name: p?.name ?? "",
      email: p?.email ?? "",
      phone: p?.phone ?? "",
    };
  }

  function onCreate() {
    router.push(`${route.path}/create`);
  }

  function onEdit(id: number) {
    router.push(`${route.path}/edit/${id}`);
  }

  function onDelete(contact: Contact) {
    const p0 = contact.people?.[0];
    const label = p0?.name ? ` (${p0.name})` : "";

    confirm.require({
      header: "Delete Contact",
      message: `Are you sure you want to delete this contact${label}?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClass: "p-button-danger",
      accept: async () => {
        await store.remove(contact.id);
      },
    });
  }

  return {
    store,
    search,
    filteredItems,
    headerTitle,
    prettyType,
    prettyTypeList,
    primaryPerson,
    onCreate,
    onEdit,
    onDelete,
  };
}
