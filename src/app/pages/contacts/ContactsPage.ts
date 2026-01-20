import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useContactStore } from "@/app/stores/contact";
import type { ContactType } from "@/app/types/contact";

const LABELS: Record<ContactType, string> = {
  customer: "Customers",
  supplier: "Suppliers",
  road_haulier: "Road Hauliers",
  airline: "Airlines",
  rail_operator: "Rail Operators",
  shipping_line: "Shipping Lines",
};

export function useContactsPage() {
  const store = useContactStore();
  const route = useRoute();
  const router = useRouter();

  const search = ref("");

  const contactType = computed(() => route.meta.contactType as ContactType);

  const headerTitle = computed(() => LABELS[contactType.value] ?? "Contacts");

  watchEffect(async () => {
    if (!contactType.value) return;
    await store.setType(contactType.value);
  });

  const filteredItems = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return store.items;

    return store.items.filter((c) => {
      return (
        (c.address ?? "").toLowerCase().includes(q) ||
        (c.country ?? "").toLowerCase().includes(q) ||
        (c.eori ?? "").toLowerCase().includes(q) ||
        (c.contact_type ?? "").toLowerCase().includes(q)
      );
    });
  });

  function prettyType(type: string) {
    return LABELS[type as ContactType] ?? type;
  }

  function onCreate() {
    // you can open a dialog later
    console.log("create contact");
  }

  function onEdit(id: number) {
    console.log("edit contact", id);
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this contact?")) return;
    await store.remove(id);
  }

  return {
    store,
    search,
    filteredItems,
    headerTitle,
    prettyType,
    onCreate,
    onEdit,
    onDelete,
  };
}
