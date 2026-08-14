import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { theme } from "@/lib/theme";

interface OrderItem { id: string; productNameSnapshot: string; skuSnapshot: string; unitSnapshot: string; quantity: number }
interface OrderDetail { id: string; reference: string; status: string; createdAt: string }

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refresh } = useCart();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ order: OrderDetail; items: OrderItem[] }>(`/api/mobile/orders/${id}`);
      setOrder(data.order);
      setItems(data.items);
    } catch {
      // ignore
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleReorder() {
    setReordering(true);
    try {
      await apiFetch(`/api/mobile/orders/${id}/reorder`, { method: "POST" });
      await refresh();
      router.push("/(app)/cart");
    } finally {
      setReordering(false);
    }
  }

  if (!order) return null;

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>{order.reference}</Text>
            <Text style={styles.subtitle}>{new Date(order.createdAt).toLocaleString("fr-FR")} · {order.status}</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.productNameSnapshot}</Text>
              <Text style={styles.cardMeta}>{item.skuSnapshot} · {item.unitSnapshot}</Text>
            </View>
            <Text style={styles.qty}>× {item.quantity}</Text>
          </View>
        )}
        ListFooterComponent={
          <Pressable style={styles.reorderButton} onPress={handleReorder} disabled={reordering}>
            <Text style={styles.reorderButtonText}>{reordering ? "Ajout..." : "Recommander à l'identique"}</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginBottom: theme.spacing.lg },
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
  qty: { fontSize: 14, fontWeight: "700", color: theme.colors.text },
  reorderButton: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: 14, alignItems: "center", marginTop: theme.spacing.md },
  reorderButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
