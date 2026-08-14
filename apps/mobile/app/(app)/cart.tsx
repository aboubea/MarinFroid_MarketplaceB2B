import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { theme } from "@/lib/theme";

export default function CartScreen() {
  const { items, refresh, setItemQuantity } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const data = await apiFetch<{ orderId: string }>("/api/mobile/orders", { method: "POST" });
      await refresh();
      router.push(`/(app)/orders/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        data={items}
        keyExtractor={(item) => item.productId}
        ListHeaderComponent={<Text style={styles.title}>Panier</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Votre panier est vide.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.sku} · {item.unit}</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable style={styles.stepperButton} onPress={() => setItemQuantity(item.productId, item.quantity - 1)}>
                <Text style={styles.stepperText}>−</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{item.quantity}</Text>
              <Pressable style={styles.stepperButton} onPress={() => setItemQuantity(item.productId, item.quantity + 1)}>
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          items.length > 0 ? (
            <View style={{ marginTop: theme.spacing.lg }}>
              {error && <Text style={styles.error}>{error}</Text>}
              <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? "Validation..." : "Valider la commande"}</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.text, marginBottom: theme.spacing.lg },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
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
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperButton: { width: 32, height: 32, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  stepperText: { fontSize: 16, color: theme.colors.text },
  stepperValue: { minWidth: 24, textAlign: "center", fontSize: 14, fontWeight: "600" },
  submitButton: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: 14, alignItems: "center" },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  error: { color: theme.colors.danger, fontSize: 13, marginBottom: theme.spacing.sm },
});
