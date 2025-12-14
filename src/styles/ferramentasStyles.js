import { StyleSheet } from "react-native";

export default StyleSheet.create({
  /* =========================
     CONTAINER GERAL
  ========================= */
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
    padding: 14,
  },

  /* =========================
     HEADER MODERNO
  ========================= */
  header: {
    backgroundColor: "#0b5394",
    paddingVertical: 22,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  /* =========================
     TABS
  ========================= */
  tabs: {
    flexDirection: "row",
    backgroundColor: "#dce3f7",
    borderRadius: 18,
    padding: 6,
    marginVertical: 16,
    elevation: 4,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
  },

  tabActive: {
    backgroundColor: "#0b5394",
    elevation: 4,
  },

  tabText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0b5394",
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "900",
  },

  /* =========================
     CABEÇALHOS DE GRUPO
  ========================= */
  headerGrupo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0b5394",
    marginTop: 22,
    marginBottom: 8,
    paddingLeft: 6,
  },

  /* =========================
     CARD PADRÃO
  ========================= */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#e5ebf4",
  },

  cardRelatorio: {
    backgroundColor: "#f5f8ff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dde6f5",
  },

  nome: {
    fontWeight: "900",
    fontSize: 17,
    color: "#0b5394",
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
  },

  situacao: {
    fontWeight: "800",
    marginTop: 8,
    fontSize: 14,
  },

  /* =========================
     BOTÃO FLUTUANTE
  ========================= */
  fab: {
    position: "absolute",
    right: 22,
    bottom: 22,
    backgroundColor: "#0b5394",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 14,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  /* =========================
     BUSCA
  ========================= */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e6ef",
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  /* =========================
     BOTÃO PDF
  ========================= */
  btnPdf: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22c55e",
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },

  btnPdfText: {
    color: "#fff",
    fontWeight: "900",
    marginLeft: 8,
    fontSize: 15,
  },

  /* =========================
     MODAL
  ========================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 16,
    textAlign: "center",
  },

  modalInput: {
    backgroundColor: "#f3f6fb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#dde3ee",
  },

  modalBtn: {
    backgroundColor: "#0b5394",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 5,
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  /* =========================
     SELEÇÃO DE OBRA
  ========================= */
  selectWrap: {
    flex: 1,
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    alignItems: "center",
  },

  selectTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 32,
  },

  selectCard: {
    backgroundColor: "#0b5394",
    width: "80%",
    paddingVertical: 20,
    borderRadius: 22,
    marginBottom: 20,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  selectCardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
