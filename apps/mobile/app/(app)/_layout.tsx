import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Text } from "react-native";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart-context";
import { theme } from "@/lib/theme";

export default function AppLayout() {
  const { user, loading } = useSession();
  const { count, refresh } = useCart();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (loading || !user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil" }} />
      <Tabs.Screen name="catalog" options={{ title: "Catalogue" }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Panier",
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tabs.Screen name="orders/index" options={{ title: "Commandes" }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
    </Tabs>
  );
}
