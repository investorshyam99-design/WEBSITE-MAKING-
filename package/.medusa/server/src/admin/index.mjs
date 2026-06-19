import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { defineWidgetConfig, defineRouteConfig } from "@medusajs/admin-sdk";
import { EllipsisHorizontal, PencilSquare, Trash, ArrowPathMini } from "@medusajs/icons";
import { Container, Heading, Badge, DropdownMenu, IconButton, Button, Text, FocusModal, Label, Input, Select, Prompt, toast } from "@medusajs/ui";
import { useState, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
const PRINT_TYPE_OPTIONS = [
  { id: 1, label: "DTG" },
  { id: 2, label: "All over Printed Products" },
  { id: 3, label: "Embroidery" },
  { id: 5, label: "Accessories" },
  { id: 6, label: "Puff print" },
  { id: 7, label: "Glow-In-Dark" },
  { id: 12, label: "Rainbow Vinyl Printing" },
  { id: 13, label: "Gold Vinyl Printing" },
  { id: 14, label: "Silver Vinyl Printing" },
  { id: 15, label: "Reflective Grey Vinyl Printing" },
  { id: 17, label: "DTF" }
];
function getPrintTypeLabel(id) {
  var _a;
  return ((_a = PRINT_TYPE_OPTIONS.find((o) => o.id === id)) == null ? void 0 : _a.label) ?? "Unknown";
}
const API_BASE$1 = "/admin/qikink-product-mapping";
const QikinkVariantMappingWidget = ({ data }) => {
  const variantId = data == null ? void 0 : data.id;
  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);
  const [skuInput, setSkuInput] = useState("");
  const [printTypeId, setPrintTypeId] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const fetchMapping = useCallback(async () => {
    var _a;
    if (!variantId) {
      setMapping(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE$1}?variant_id=${encodeURIComponent(variantId)}&limit=1`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setMapping(null);
        return;
      }
      const json = await res.json();
      const first = ((_a = json.mappings) == null ? void 0 : _a[0]) ?? null;
      setMapping(first);
      if (first) {
        setSkuInput(first.qikink_sku_id);
        setPrintTypeId(
          first.print_type_id != null && PRINT_TYPE_OPTIONS.some((o) => o.id === first.print_type_id) ? first.print_type_id : 1
        );
      } else {
        setSkuInput("");
        setPrintTypeId(1);
      }
    } catch {
      setError("Failed to load Qikink mapping");
      setMapping(null);
    } finally {
      setLoading(false);
    }
  }, [variantId]);
  useEffect(() => {
    fetchMapping();
  }, [fetchMapping]);
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSkuInput("");
    setPrintTypeId(1);
    setError(null);
    setModalOpen(true);
  };
  const handleOpenEditModal = () => {
    if (!mapping) return;
    setModalMode("edit");
    setSkuInput(mapping.qikink_sku_id);
    setPrintTypeId(
      mapping.print_type_id != null && PRINT_TYPE_OPTIONS.some((o) => o.id === mapping.print_type_id) ? mapping.print_type_id : 1
    );
    setError(null);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setError(null);
  };
  const canSubmitCreate = !!(skuInput == null ? void 0 : skuInput.trim());
  const handleSubmitModal = async () => {
    const sku = skuInput == null ? void 0 : skuInput.trim();
    if (!sku) {
      setError("Qikink SKU ID is required");
      return;
    }
    if (modalMode === "create") {
      if (!variantId) {
        setError("Variant ID is missing");
        return;
      }
      setSubmitLoading(true);
      setError(null);
      try {
        const res = await fetch(API_BASE$1, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variant_id: variantId,
            qikink_sku_id: sku,
            print_type_id: printTypeId
          })
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.message ?? "Create failed");
          return;
        }
        toast.success("Qikink variant mapping created successfully.");
        handleCloseModal();
        await fetchMapping();
        queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setSubmitLoading(false);
      }
    } else {
      if (!mapping) return;
      setSubmitLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE$1}/${mapping.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qikink_sku_id: sku,
            print_type_id: printTypeId
          })
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.message ?? "Update failed");
          return;
        }
        toast.success("Qikink variant mapping updated.");
        handleCloseModal();
        await fetchMapping();
        queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setSubmitLoading(false);
      }
    }
  };
  const handleDelete = async () => {
    if (!mapping) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE$1}/${mapping.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.message ?? "Delete failed");
        return;
      }
      toast.success("Qikink variant mapping removed.");
      setDeletePromptOpen(false);
      await fetchMapping();
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setDeleteLoading(false);
    }
  };
  const hasVariant = !!variantId;
  return /* @__PURE__ */ jsxs(Container, { className: "flex flex-col gap-y-4", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col gap-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-x-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-3", children: [
          /* @__PURE__ */ jsx(Heading, { level: "h2", children: "Qikink Variant" }),
          mapping && /* @__PURE__ */ jsx(Badge, { size: "2xsmall", color: "green", children: "Mapped" })
        ] }),
        hasVariant && /* @__PURE__ */ jsx(Fragment, { children: mapping ? /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenu.Trigger, { asChild: true, children: /* @__PURE__ */ jsx(IconButton, { variant: "transparent", size: "small", disabled: submitLoading || deleteLoading, children: /* @__PURE__ */ jsx(EllipsisHorizontal, {}) }) }),
          /* @__PURE__ */ jsxs(DropdownMenu.Content, { align: "end", children: [
            /* @__PURE__ */ jsxs(DropdownMenu.Item, { className: "gap-x-2", onSelect: handleOpenEditModal, children: [
              /* @__PURE__ */ jsx(PencilSquare, { className: "text-ui-fg-subtle" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsx(DropdownMenu.Separator, {}),
            /* @__PURE__ */ jsxs(
              DropdownMenu.Item,
              {
                className: "gap-x-2 text-ui-fg-error",
                onSelect: () => setDeletePromptOpen(true),
                children: [
                  /* @__PURE__ */ jsx(Trash, { className: "text-ui-fg-subtle" }),
                  "Delete"
                ]
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsx(Button, { variant: "primary", size: "small", onClick: handleOpenCreateModal, children: "Add Qikink Variant" }) })
      ] }),
      /* @__PURE__ */ jsx(Text, { className: "text-ui-fg-subtle", children: "Map this variant to a Qikink SKU for catalog synchronization." })
    ] }),
    !hasVariant ? /* @__PURE__ */ jsx(Text, { className: "text-ui-fg-muted txt-compact-small", children: "Open a variant to add or remove its Qikink mapping." }) : loading ? /* @__PURE__ */ jsx("div", { className: "h-10 rounded-lg bg-ui-bg-subtle animate-pulse" }) : /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-3", children: mapping && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-compact-xsmall-plus text-ui-fg-muted uppercase tracking-wide", children: "Current Qikink SKU" }),
        /* @__PURE__ */ jsx(Text, { className: "txt-compact-medium font-medium text-ui-fg-base", children: mapping.qikink_sku_id })
      ] }),
      mapping.print_type_id != null && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3", children: [
        /* @__PURE__ */ jsx(Text, { className: "txt-compact-xsmall-plus text-ui-fg-muted uppercase tracking-wide", children: "Print Type" }),
        /* @__PURE__ */ jsx(Text, { className: "txt-compact-medium font-medium text-ui-fg-base", children: getPrintTypeLabel(mapping.print_type_id) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(FocusModal, { open: modalOpen, onOpenChange: setModalOpen, children: /* @__PURE__ */ jsxs(FocusModal.Content, { children: [
      /* @__PURE__ */ jsx(FocusModal.Header, { children: /* @__PURE__ */ jsx(FocusModal.Title, { children: modalMode === "create" ? "Add Qikink Variant" : "Edit Qikink Variant" }) }),
      /* @__PURE__ */ jsxs(FocusModal.Body, { className: "flex flex-col gap-y-4", children: [
        modalMode === "create" && /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "variant_id",
            value: variantId ?? "",
            readOnly: true,
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "qikink-sku-id", size: "small", weight: "plus", children: "Qikink SKU ID" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "qikink-sku-id",
              type: "text",
              value: skuInput,
              onChange: (e) => setSkuInput(e.target.value),
              placeholder: "Enter Qikink SKU ID",
              "aria-required": true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "qikink-print-type", size: "small", weight: "plus", children: "Print Type" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: String(printTypeId),
              onValueChange: (value) => setPrintTypeId(Number(value)),
              children: [
                /* @__PURE__ */ jsx(Select.Trigger, { id: "qikink-print-type", children: /* @__PURE__ */ jsx(Select.Value, { placeholder: "Select print type" }) }),
                /* @__PURE__ */ jsx(Select.Content, { children: PRINT_TYPE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(Select.Item, { value: String(opt.id), children: opt.label }, opt.id)) })
              ]
            }
          )
        ] }),
        error && /* @__PURE__ */ jsx(Text, { className: "txt-compact-small text-ui-fg-error", children: error })
      ] }),
      /* @__PURE__ */ jsxs(FocusModal.Footer, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "secondary",
            size: "small",
            onClick: handleCloseModal,
            disabled: submitLoading,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            size: "small",
            onClick: handleSubmitModal,
            disabled: submitLoading || !canSubmitCreate,
            children: submitLoading ? "Saving…" : modalMode === "create" ? "Create Mapping" : "Save"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Prompt, { open: deletePromptOpen, onOpenChange: setDeletePromptOpen, variant: "danger", children: /* @__PURE__ */ jsxs(Prompt.Content, { children: [
      /* @__PURE__ */ jsxs(Prompt.Header, { children: [
        /* @__PURE__ */ jsx(Prompt.Title, { children: "Remove Qikink mapping?" }),
        /* @__PURE__ */ jsx(Prompt.Description, { children: "This will remove the Qikink SKU mapping for this variant. You can add a new mapping later." })
      ] }),
      /* @__PURE__ */ jsxs(Prompt.Footer, { children: [
        /* @__PURE__ */ jsx(Prompt.Cancel, { disabled: deleteLoading, children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            size: "small",
            color: "red",
            disabled: deleteLoading,
            onClick: handleDelete,
            children: deleteLoading ? "Removing…" : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
};
defineWidgetConfig({
  zone: "product_variant.details.after"
});
const API_BASE = "/admin/qikink-order-mapping";
const REFRESH_URL = `${API_BASE}/refresh`;
const QikinkOrderMappingsPage = () => {
  const [mappings, setMappings] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit] = useState(50);
  const [refreshStatusLoading, setRefreshStatusLoading] = useState(false);
  const filterChangeEffectRan = useRef(false);
  const loadMappings = useCallback(
    async (nextOffset = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(limit));
        params.set("offset", String(nextOffset));
        params.set("order", "created_at");
        params.set("order_direction", "DESC");
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`${API_BASE}?${params.toString()}`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setMappings(data.mappings ?? []);
        setCount(data.count ?? 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load mappings");
      } finally {
        setIsLoading(false);
      }
    },
    [limit, statusFilter]
  );
  const handleRefreshStatus = useCallback(async () => {
    setRefreshStatusLoading(true);
    try {
      const res = await fetch(REFRESH_URL, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Refresh failed");
      }
      const data = await res.json();
      toast.success(
        data.updated != null ? `Statuses refreshed. ${data.updated} mapping(s) updated.` : "Statuses refreshed."
      );
      await loadMappings(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshStatusLoading(false);
    }
  }, [loadMappings]);
  useEffect(() => {
    void handleRefreshStatus();
  }, []);
  useEffect(() => {
    if (!filterChangeEffectRan.current) {
      filterChangeEffectRan.current = true;
      return;
    }
    void loadMappings(0);
  }, [statusFilter, limit, loadMappings]);
  const statusBadgeColor = (status) => {
    const s = status.toLowerCase();
    if (s === "created" || s === "pending" || s === "pending_review" || s === "confirmed") return "orange";
    if (s === "shipped" || s === "completed" || s === "fulfilled") return "green";
    if (s === "cancelled" || s === "canceled") return "red";
    return "grey";
  };
  return /* @__PURE__ */ jsx("div", { className: "w-full p-6", children: /* @__PURE__ */ jsxs(Container, { className: "mx-auto flex w-full max-w-7xl flex-col gap-6 p-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx(Heading, { level: "h1", children: "Qikink Orders" }),
        /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: 'View status of orders synced to Qikink (created automatically when an order contains mapped variants). Use "Refresh status" to sync status from Qikink.' })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: handleRefreshStatus,
          disabled: isLoading || refreshStatusLoading,
          children: refreshStatusLoading ? "Refreshing…" : "Refresh status"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx(Text, { className: "txt-compact-small font-medium text-ui-fg-muted", children: "Filter by status:" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          className: "h-9 rounded-md border border-ui-border-base bg-transparent px-3 text-sm text-ui-fg-base outline-none transition focus:ring-2 focus:ring-ui-fg-interactive",
          children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "All" }),
            /* @__PURE__ */ jsx("option", { value: "created", children: "Created" }),
            /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsx("option", { value: "shipped", children: "Shipped" }),
            /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
            /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-ui-border-strong p-6 text-center", children: [
      /* @__PURE__ */ jsx(Text, { weight: "plus", className: "text-ui-fg-error", children: error }),
      /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "mt-4", onClick: () => loadMappings(0), children: "Try again" })
    ] }),
    !error && isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Text, { children: "Loading mappings..." }) }),
    !error && !isLoading && mappings.length === 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-ui-border-strong p-10 text-center", children: [
      /* @__PURE__ */ jsx(Heading, { level: "h3", className: "text-xl", children: "No Qikink orders yet" }),
      /* @__PURE__ */ jsx(Text, { size: "small", className: "mt-2 text-ui-fg-subtle", children: "Orders are created automatically when an order is placed and contains variants linked to a Qikink SKU." })
    ] }),
    !error && !isLoading && mappings.length > 0 && /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-ui-border-base", children: [
      /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-ui-border-base", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-ui-bg-subtle", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ui-fg-muted", children: "Medusa Order ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ui-fg-muted", children: "Qikink Order ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ui-fg-muted", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ui-fg-muted", children: "Created" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-ui-border-subtle bg-ui-bg-base", children: mappings.map((m) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-ui-bg-subtle", children: [
          /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-4 py-3 text-sm font-medium text-ui-fg-base", children: m.medusa_order_id }),
          /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-4 py-3 text-sm text-ui-fg-base", children: m.qikink_order_id }),
          /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-4 py-3", children: /* @__PURE__ */ jsx(Badge, { size: "2xsmall", color: statusBadgeColor(m.status), children: m.status }) }),
          /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap px-4 py-3 text-sm text-ui-fg-muted", children: new Date(m.created_at).toLocaleString() })
        ] }, m.id)) })
      ] }),
      count > mappings.length && /* @__PURE__ */ jsxs("div", { className: "border-t border-ui-border-base bg-ui-bg-subtle px-4 py-2 text-sm text-ui-fg-muted", children: [
        "Showing ",
        mappings.length,
        " of ",
        count,
        " mappings"
      ] })
    ] })
  ] }) });
};
const config = defineRouteConfig({
  label: "Qikink Orders",
  icon: ArrowPathMini
});
const i18nTranslations0 = {};
const widgetModule = { widgets: [
  {
    Component: QikinkVariantMappingWidget,
    zone: ["product_variant.details.after"]
  }
] };
const routeModule = {
  routes: [
    {
      Component: QikinkOrderMappingsPage,
      path: "/qikink-orders"
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config.label,
      icon: config.icon,
      path: "/qikink-orders",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: i18nTranslations0 };
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule
};
export {
  plugin as default
};
