import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart-context";
import { theme } from "@/lib/theme";

interface RecentProduct { productId: string; name: string; sku: string; unit: string }
interface RecentOrder { id: string; reference: string; status: string; createdAt: string }

export default function DashboardScreen() {
  const { user } = useSession();
  const { addItem } = useCart();
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ recentProducts: RecentProduct[]; recentOrders: RecentOrder[] }>("/api/mobile/dashboard");
      setRecentProducts(data.recentProducts);
      setRecentOrders(data.recentOrders);
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.greeting}>Bonjour {user?.fullName.split(" ")[0]}</Text>
            <Text style={styles.subtitle}>{user?.organizationName}</Text>
            <Text style={styles.sectionTitle}>Vos produits habituels</Text>
          </>
        }
        data={recentProducts}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.sku} · {item.unit}</Text>
            </View>
            <Pressable style={styles.addButton} onPress={() => addItem(item.productId, 1)}>
              <Text style={styles.addButtonText}>Ajouter</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun achat récent.</Text>}
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>Dernières commandes</Text>
            {recentOrders.length === 0 && <Text style={styles.empty}>Aucune commande passée.</Text>}
            {recentOrders.map((o) => (
              <Pressable key={o.id} style={styles.card} onPress={() => router.push(`/(app)/orders/${o.id}`)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{o.reference}</Text>
                  <Text style={styles.cardMeta}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</Text>
                </View>
                <Text style={styles.badge}>{o.status}</Text>
              </Pressable>
            ))}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  greeting: { fontSize: 22, fontWeight: "700", color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
  cardMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  addButton: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: 8, paddingHorizontal: 14 },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
  badge: { fontSize: 12, fontWeight: "600", color: theme.colors.textMuted },
});
