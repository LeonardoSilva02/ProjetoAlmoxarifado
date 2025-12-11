import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  /* ============================
        🔵 CABEÇALHO
  ============================ */
  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  filterBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
  },

  /* ============================
        🏭 SELEÇÃO DO ALMOX
  ============================ */
  selectWrap: {
    flex: 1,
    backgroundColor: "#eef3ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  selectTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 40,
    textAlign: "center",
  },

  selectBtn: {
    width: "88%",
    backgroundColor: "#0b5394",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 8,
    marginBottom: 20,
  },

  selectBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginLeft: 8,
  },

  /* ============================
        📌 ABAS
  ============================ */
  tabs: {
    flexDirection: "row",
    backgroundColor: "#dce6f7",
    margin: 10,
    borderRadius: 14,
    overflow: "hidden",
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#0b5394",
  },

  tabText: {
    color: "#0b5394",
    fontSize: 15,
    fontWeight: "800",
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "900",
  },

  /* ============================
        🟦 CARD DE MOVIMENTAÇÃO (BRANCO)
  ============================ */
  card: {
    backgroundColor: "#ffffff",   // ✅ branco
    marginHorizontal: 12,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 7,
    borderLeftColor: "#4cd137",   // verde status

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },

    flexDirection: "row",
  },

  nome: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0b5394",   // azul escuro
    marginBottom: 6,
  },

  meta: {
    color: "#333",      // texto escuro no card branco
    fontSize: 14,
    marginBottom: 2,
  },

  /* ============================
        🔄 BOTÃO DEVOLVER
  ============================ */
  btnDevolver: {
    backgroundColor: "#4cd137",
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
    marginTop: 10,
    elevation: 6,
  },

  /* ============================
        ➕ BOTÃO FLUTUANTE
  ============================ */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#0b5394",
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
  },

  /* ============================
        🪟 MODAL
  ============================ */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  modalCard: {
    backgroundColor: "#ffffff",       // 🔥 modal branco
    width: "92%",
    padding: 22,
    borderRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 18,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#f1f4ff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#cfd6ea",
    marginBottom: 12,
    fontSize: 15,
    color: "#0b5394",
  },

  selectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#dcdcdc",
  },

  modalActions: {
    flexDirection: "row",
    marginTop: 16,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 6,
    backgroundColor: "#0b5394",
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
