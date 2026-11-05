
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { GET_ADMIN_PRODUCTS } from "../../graphql/queries/adminProductQueries";

import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from "../../graphql/mutations/adminProductMutations";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
};

const AdminProducts = () => {
  const { data, loading, error, refetch } = useQuery(
    GET_ADMIN_PRODUCTS
  );

  const [createProduct, { loading: creating }] =
    useMutation(CREATE_PRODUCT);

  const [updateProduct, { loading: updating }] =
    useMutation(UPDATE_PRODUCT);

  const [deleteProduct, { loading: deleting }] =
    useMutation(DELETE_PRODUCT);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const products = data?.adminProducts || [];

  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // --------------------------------
  // FORM HANDLERS
  // --------------------------------

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      category: product.category || "",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------
  // CREATE / UPDATE PRODUCT
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }

    if (!form.category.trim()) {
      setFormError("Category is required.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setFormError("Enter a valid non-negative price.");
      return;
    }

    if (
      form.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setFormError("Stock must be a non-negative integer.");
      return;
    }

    const variables = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category.trim(),
    };

    try {
      if (editingProduct) {
        await updateProduct({
          variables: {
            productId: editingProduct.id,
            ...variables,
          },
        });
      } else {
        await createProduct({
          variables,
        });
      }

      await refetch();
      closeModal();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    }
  };

  // --------------------------------
  // DELETE PRODUCT
  // --------------------------------

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProduct({
        variables: {
          productId: product.id,
        },
      });

      await refetch();
    } catch (err) {
      alert(err.message || "Unable to delete product.");
    }
  };

  // --------------------------------
  // FILTER PRODUCTS
  // --------------------------------

  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      product.name?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "all" ||
      product.category === categoryFilter;

    const stock = product.stock ?? 0;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && stock > 0 && stock <= 5) ||
      (stockFilter === "out" && stock === 0) ||
      (stockFilter === "available" && stock > 5);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStock
    );
  });

  // --------------------------------
  // STOCK BADGE
  // --------------------------------

  const getStockConfig = (stock) => {
    if (stock === 0) {
      return {
        label: "Out of stock",
        className: "bg-red-50 text-red-600",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low stock",
        className: "bg-orange-50 text-orange-600",
      };
    }

    return {
      label: "In stock",
      className: "bg-green-50 text-green-600",
    };
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Failed to load products: {error.message}
      </div>
    );
  }

  // --------------------------------
  // STATISTICS
  // --------------------------------

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) =>
      (product.stock ?? 0) > 0 &&
      (product.stock ?? 0) <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => (product.stock ?? 0) === 0
  ).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Products
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your NexaCart product catalog.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* STAT CARDS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Total Products
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-semibold text-orange-600">
            {lowStockProducts}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm md:col-span-1">
          <p className="text-xs text-[var(--muted)]">
            Out of Stock
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            {outOfStockProducts}
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}

      <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="all">All Stock</option>
            <option value="available">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* PRODUCT TABLE */}

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead className="border-b border-[var(--border)] bg-[#FAFAFA]">
              <tr className="text-left">
                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Product
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Price
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Stock
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Rating
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {filteredProducts.map((product) => {
                const stock = product.stock ?? 0;
                const stockConfig = getStockConfig(stock);

                return (
                  <tr
                    key={product.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Package
                            size={19}
                            className="text-gray-500"
                          />
                        </div>

                        <div className="max-w-[220px]">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>

                          <p className="truncate text-xs text-[var(--muted)]">
                            {product.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.category || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      ₹{Number(product.price ?? 0).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">
                          {stock}
                        </span>

                        <div>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${stockConfig.className}`}
                          >
                            {stockConfig.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {Number(product.rating ?? 0).toFixed(1)} / 5
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                          className="rounded-lg border border-[var(--border)] p-2 transition hover:bg-gray-100"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleting}
                          title="Delete product"
                          className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATES */}

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package
              size={32}
              className="mx-auto text-[var(--muted)]"
            />

            <p className="mt-3 text-sm font-medium">
              {products.length === 0
                ? "No products available"
                : "No matching products"}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {products.length === 0
                ? "Add your first product to get started."
                : "Try changing your search or filters."}
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Enter your product information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 transition hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Product Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Electronics"
                  list="product-categories"
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  required
                />

                <datalist id="product-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              {/* PRICE AND STOCK */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    required
                  />
                </div>
              </div>

              {/* FORM ERROR */}

              {formError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating || updating}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {(creating || updating) && (
                    <Loader2 size={15} className="animate-spin" />
                  )}

                  {editingProduct
                    ? updating
                      ? "Updating..."
                      : "Save Changes"
                    : creating
                    ? "Creating..."
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
