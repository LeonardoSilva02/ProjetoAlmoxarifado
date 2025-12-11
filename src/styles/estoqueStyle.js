import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  /* =========================
     TELA PRINCIPAL
  ========================= */
  tabWrap: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f6fb",
  },

  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 12,
    letterSpacing: 0.5,
  },

  /* =========================
     🔎 BUSCA
  ========================= */
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#0f172a",
  },

  /* =========================
     TELA DE SELEÇÃO
  ========================= */
  selectWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f6fb",
    padding: 28,
  },

  selectTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 34,
  },

  selectBtn: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0b5394",
    paddingVertical: 20,
    borderRadius: 22,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  selectBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginLeft: 12,
  },

  /* =========================
     CARD DO ITEM
  ========================= */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  cardInfo: { 
    flex: 1 
  },

  itemName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 8,
  },

  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  meta: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },

  data: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  update: {
    fontSize: 12,
    color: "#1d4ed8",
    fontWeight: "700",
    marginTop: 2,
  },

  cardActions: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingLeft: 12,
  },

  /* =========================
     BOTÃO FLUTUANTE
  ========================= */
  fab: {
    position: "absolute",
    right: 24,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0b5394",
    justifyContent: "center",
    alignItems: "center",
    elevation: 14,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  /* =========================
     MODAL
  ========================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: 26,
    elevation: 16,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 18,
    textAlign: "center",
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#f8fafc",
    fontSize: 15,
  },

  modalActions: {
    flexDirection: "row",
    marginTop: 12,
  },

  modalBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0b5394",
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 6,
    elevation: 6,
  },
});
