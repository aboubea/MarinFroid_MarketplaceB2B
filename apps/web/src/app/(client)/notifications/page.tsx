import { NotificationsCenter } from "@/components/NotificationsCenter";
import { PageHeader } from "@/components/PageHeader";

export default async function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" />
      <NotificationsCenter />
    </>
  );
}
