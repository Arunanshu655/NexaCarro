import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Package,
  Truck,
  XCircle,
  Search,
  CreditCard,
} from "lucide-react";

import { GET_ADMIN_ORDERS } from "../../graphql/queries/adminQueries";
import { UPDATE_ORDER_STATUS } from "../../graphql/mutations/adminMutations";

const AdminOrders = () => {
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_ADMIN_ORDERS);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [updateOrderStatus, { loading: updating }] =
    useMutation(UPDATE_ORDER_STATUS);

  const orders = data?.adminOrders || [];

  // --------------------------------
  // UPDATE ORDER STATUS
  // --------------------------------
  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus({
        variables: {
          orderId,
          status,
        },
      });

      await refetch();
    } catch (error) {
      alert(error.message);
    }
  };

  // --------------------------------
  // STATUS CONFIG
  // --------------------------------
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock3,
          className: "bg-orange-50 text-[var(--warning)]",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className: "bg-blue-50 text-[var(--primary)]",
        };

      case "shipped":
        return {
          label: "Shipped",
          icon: Truck,
          className: "bg-purple-50 text-purple-600",
        };

      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className: "bg-green-50 text-[var(--success)]",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className: "bg-red-50 text-[var(--danger)]",
        };

      default:
        return {
          label: status || "Unknown",
          icon: AlertCircle,
          className: "bg-gray-100 text-gray-600",
        };
    }
  };

  // --------------------------------
  // AVAILABLE STATUS TRANSITIONS
  // --------------------------------
  const getAvailableStatuses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return ["confirmed", "cancelled"];

      case "confirmed":
        return ["shipped", "cancelled"];

      case "shipped":
        return ["delivered"];

      default:
        return [];
    }
  };

  // --------------------------------
  // FILTER ORDERS
  // --------------------------------
  const filteredOrders = orders.filter((order) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      order.id?.toLowerCase().includes(searchText) ||
      order.user?.name?.toLowerCase().includes(searchText) ||
      order.user?.email?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter;

    const matchesPayment =
      paymentFilter === "all" ||
      order.payment?.status?.toLowerCase() === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // --------------------------------
  // LOADING
  // --------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-[10px] bg-gray-100"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-[10px] bg-gray-100" />
      </div>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------
  if (error) {
    return (
      <div className="rounded-[10px] border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Failed to load orders: {error.message}
      </div>
    );
  }

  // --------------------------------
  // STATS
  // --------------------------------
  const pendingCount = orders.filter(
    (order) => order.status?.toLowerCase() === "pending"
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status?.toLowerCase() === "shipped"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status?.toLowerCase() === "delivered"
  ).length;

  return (
    <div className="space-y-6">
      {/* -------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------- */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Orders
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage and update customer orders.
        </p>
      </div>

      {/* -------------------------------- */}
      {/* STATS */}
      {/* -------------------------------- */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-[10px] border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Total Orders
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {orders.length}
          </p>
        </div>

        <div className="rounded-[10px] border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Pending
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-[10px] border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Shipped
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {shippedCount}
          </p>
        </div>

        <div className="rounded-[10px] border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Delivered
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {deliveredCount}
          </p>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* FILTERS */}
      {/* -------------------------------- */}
      <div className="rounded-[10px] border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              placeholder="Search order ID, customer or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-lg
                border
                border-[var(--border)]
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-gray-400
              "
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              rounded-lg
              border
              border-[var(--border)]
              bg-white
              px-4
              py-2.5
              text-sm
              outline-none
              focus:border-gray-400
            "
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="
              rounded-lg
              border
              border-[var(--border)]
              bg-white
              px-4
              py-2.5
              text-sm
              outline-none
              focus:border-gray-400
            "
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Filter result count */}
        <div className="mt-3 text-xs text-[var(--muted)]">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* -------------------------------- */}
      {/* ORDERS TABLE */}
      {/* -------------------------------- */}
      <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white shadow-sm">
        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="border-b border-[var(--border)] bg-[#FAFAFA]">
              <tr className="text-left">
                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Order
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Customer
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Items
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Amount
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Payment
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-medium text-[var(--muted)]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {filteredOrders.map((order) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;

                const availableStatuses =
                  getAvailableStatuses(order.status);

                const paymentStatus =
                  order.payment?.status || "pending";

                return (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* Order */}
                    <td className="px-5 py-4">
                      <p className="max-w-[130px] truncate text-sm font-medium">
                        #{order.id?.slice(-8)}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {order.user?.name || "Unknown"}
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {order.user?.email || "—"}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Package
                          size={15}
                          className="text-[var(--muted)]"
                        />

                        <span className="text-sm">
                          {order.items?.reduce(
                            (total, item) =>
                              total + item.quantity,
                            0
                          ) || 0}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold">
                        ₹{order.totalPrice?.toFixed(2)}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-4">
                      <div
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          ${
                            paymentStatus === "paid"
                              ? "bg-green-50 text-[var(--success)]"
                              : paymentStatus === "failed"
                              ? "bg-red-50 text-[var(--danger)]"
                              : paymentStatus === "refunded"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-orange-50 text-[var(--warning)]"
                          }
                        `}
                      >
                        <CreditCard size={12} />

                        {paymentStatus}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-3
                          py-1.5
                          text-xs
                          font-medium
                          ${status.className}
                        `}
                      >
                        <StatusIcon size={13} />

                        {status.label}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      {availableStatuses.length > 0 ? (
                        <div className="relative inline-flex">
                          <select
                            disabled={updating}
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(
                                  order.id,
                                  e.target.value
                                );
                              }
                            }}
                            className="
                              appearance-none
                              rounded-full
                              border
                              border-[var(--border)]
                              bg-white
                              py-2
                              pl-3
                              pr-8
                              text-xs
                              font-medium
                              outline-none
                              transition
                              hover:bg-gray-50
                              focus:border-gray-400
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            <option value="" disabled>
                              {updating
                                ? "Updating..."
                                : "Update"}
                            </option>

                            {availableStatuses.map(
                              (nextStatus) => (
                                <option
                                  key={nextStatus}
                                  value={nextStatus}
                                >
                                  {nextStatus
                                    .charAt(0)
                                    .toUpperCase() +
                                    nextStatus.slice(1)}
                                </option>
                              )
                            )}
                          </select>

                          <ChevronDown
                            size={14}
                            className="
                              pointer-events-none
                              absolute
                              right-3
                              top-1/2
                              -translate-y-1/2
                              text-[var(--muted)]
                            "
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* -------------------------------- */}
        {/* MOBILE CARDS */}
        {/* -------------------------------- */}
        <div className="divide-y divide-[var(--border)] md:hidden">
          {filteredOrders.map((order) => {
            const status = getStatusConfig(order.status);
            const StatusIcon = status.icon;

            const availableStatuses =
              getAvailableStatuses(order.status);

            const paymentStatus =
              order.payment?.status || "pending";

            const itemCount =
              order.items?.reduce(
                (total, item) => total + item.quantity,
                0
              ) || 0;

            return (
              <div key={order.id} className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      #{order.id?.slice(-8)}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {order.user?.name || "Unknown"}
                    </p>

                    <p className="text-xs text-[var(--muted)]">
                      {order.user?.email || "—"}
                    </p>
                  </div>

                  <span className="text-sm font-semibold">
                    ₹{order.totalPrice?.toFixed(2)}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      ${status.className}
                    `}
                  >
                    <StatusIcon size={13} />
                    {status.label}
                  </div>

                  <div
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      ${
                        paymentStatus === "paid"
                          ? "bg-green-50 text-[var(--success)]"
                          : paymentStatus === "failed"
                          ? "bg-red-50 text-[var(--danger)]"
                          : paymentStatus === "refunded"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-[var(--warning)]"
                      }
                    `}
                  >
                    <CreditCard size={12} />
                    {paymentStatus}
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs text-[var(--muted)]">
                    <Package size={13} />
                    {itemCount} item
                    {itemCount !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Action */}
                {availableStatuses.length > 0 && (
                  <div className="mt-4">
                    <div className="relative">
                      <select
                        disabled={updating}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusChange(
                              order.id,
                              e.target.value
                            );
                          }
                        }}
                        className="
                          w-full
                          appearance-none
                          rounded-lg
                          border
                          border-[var(--border)]
                          bg-white
                          px-3
                          py-2.5
                          pr-8
                          text-sm
                          outline-none
                          focus:border-gray-400
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <option value="" disabled>
                          {updating
                            ? "Updating..."
                            : "Update status"}
                        </option>

                        {availableStatuses.map(
                          (nextStatus) => (
                            <option
                              key={nextStatus}
                              value={nextStatus}
                            >
                              {nextStatus
                                .charAt(0)
                                .toUpperCase() +
                                nextStatus.slice(1)}
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown
                        size={15}
                        className="
                          pointer-events-none
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[var(--muted)]
                        "
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* -------------------------------- */}
        {/* NO FILTER RESULTS */}
        {/* -------------------------------- */}
        {orders.length > 0 && filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Search
              size={32}
              className="mx-auto text-[var(--muted)]"
            />

            <p className="mt-3 text-sm font-medium">
              No matching orders
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* -------------------------------- */}
        {/* NO ORDERS */}
        {/* -------------------------------- */}
        {orders.length === 0 && (
          <div className="p-12 text-center">
            <Package
              size={32}
              className="mx-auto text-[var(--muted)]"
            />

            <p className="mt-3 text-sm font-medium">
              No orders found
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Customer orders will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;