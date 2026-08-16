import { AdminOrdersBoard } from "@/components/AdminOrdersBoard";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminOrdersPage() {
  return (
    <>
      <PageHeader title="Commandes" />
      <AdminOrdersBoard />
    </>
  );
}
