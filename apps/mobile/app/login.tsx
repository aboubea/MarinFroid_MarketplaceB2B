import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ token: string; user: { fullName: string; role: string; organizationName: string } }>(
        "/api/mobile/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      await signIn(data.token, data.user);
      router.replace("/(app)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Marin Froid</Text>
        <Text style={styles.subtitle}>Portail de commande privé</Text>
        <TextInput
          style={styles.input}
          placeholder="Adresse e-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Connexion..." : "Se connecter"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center", padding: theme.spacing.xl },
  card: { width: "100%", maxWidth: 380, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.xxl, borderWidth: 1, borderColor: theme.colors.border },
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: theme.spacing.xl },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 12, fontSize: 14, marginBottom: theme.spacing.md, color: theme.colors.text },
  error: { color: theme.colors.danger, fontSize: 13, marginBottom: theme.spacing.md },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
