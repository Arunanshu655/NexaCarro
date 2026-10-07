import { useMutation, useQuery } from "@apollo/client/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Package,
  Truck,
  XCircle,
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

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock3,
          className: "bg-orange-50 text-[var(--warning)]",
        };

      case "paid":
        return {
          label: "paid",
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

  const getAvailableStatuses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return ["paid", "cancelled"];

      case "paid":
        return ["shipped", "cancelled"];

      case "shipped":
        return ["delivered"];

      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-64 animate-pulse rounded-[10px] bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="
        rounded-[10px]
        border border-red-200
        bg-red-50
        p-5
        text-sm
        text-red-600
      ">
        Failed to load orders: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Orders
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage and update customer orders.
        </p>
      </div>

      {/* Stats */}
      <div className="
        grid
        grid-cols-2
        gap-4
        md:grid-cols-4
      ">
        <div className="
          rounded-[10px]
          border border-[var(--border)]
          bg-white
          p-4
          shadow-sm
        ">
          <p className="text-xs text-[var(--muted)]">
            Total Orders
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {orders.length}
          </p>
        </div>

        <div className="
          rounded-[10px]
          border border-[var(--border)]
          bg-white
          p-4
          shadow-sm
        ">
          <p className="text-xs text-[var(--muted)]">
            Pending
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {
              orders.filter(
                (order) =>
                  order.status?.toLowerCase() === "pending"
              ).length
            }
          </p>
        </div>

        <div className="
          rounded-[10px]
          border border-[var(--border)]
          bg-white
          p-4
          shadow-sm
        ">
          <p className="text-xs text-[var(--muted)]">
            Shipped
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {
              orders.filter(
                (order) =>
                  order.status?.toLowerCase() === "shipped"
              ).length
            }
          </p>
        </div>

        <div className="
          rounded-[10px]
          border border-[var(--border)]
          bg-white
          p-4
          shadow-sm
        ">
          <p className="text-xs text-[var(--muted)]">
            Delivered
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {
              orders.filter(
                (order) =>
                  order.status?.toLowerCase() === "delivered"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Orders */}
      <div className="
        overflow-hidden
        rounded-[10px]
        border border-[var(--border)]
        bg-white
        shadow-sm
      ">

        {/* Desktop table */}
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
              {orders.map((order) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;
                const availableStatuses =
                  getAvailableStatuses(order.status);

                return (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50"
                  >

                    {/* Order */}
                    <td className="px-5 py-4">
                      <p className="
                        max-w-[130px]
                        truncate
                        text-sm
                        font-medium
                      ">
                        #{order.id.slice(-8)}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {order.user?.name}
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {order.user?.email}
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
                          )}
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
                      <span className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        ${
                          order.payment?.status === "paid"
                            ? "bg-green-50 text-[var(--success)]"
                            : "bg-orange-50 text-[var(--warning)]"
                        }
                      `}>
                        {order.payment?.status || "pending"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        ${status.className}
                      `}>
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
                            value=""
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value
                              )
                            }
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
                              Update
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
                        <span className="
                          text-xs
                          text-[var(--muted)]
                        ">
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

        {/* Empty state */}
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