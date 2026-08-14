import { useCallback, useState } from "react";
import { View, Text, SectionList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { theme } from "@/lib/theme";

interface Product { id: string; name: string; sku: string; unit: string }
interface Category { id: string; name: string; products: Product[] }

export default function CatalogScreen() {
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ categories: Category[] }>("/api/mobile/catalog");
      setCategories(data.categories.filter((c) => c.products.length > 0));
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

  async function handleAdd(productId: string) {
    await addItem(productId, 1);
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1000);
  }

  return (
    <View style={styles.container}>
      <SectionList
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        sections={categories.map((c) => ({ title: c.name, data: c.products }))}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.sku} · {item.unit}</Text>
            </View>
            <Pressable style={styles.addButton} onPress={() => handleAdd(item.id)}>
              <Text style={styles.addButtonText}>{addedId === item.id ? "Ajouté ✓" : "Ajouter"}</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
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
});
