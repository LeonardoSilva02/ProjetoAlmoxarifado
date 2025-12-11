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
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  /* =========================
     TABS REFINADAS
  ========================= */
  tabs: {
    flexDirection: "row",
    backgroundColor: "#dce3f7",
    borderRadius: 16,
    padding: 5,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },

  tabActive: {
    backgroundColor: "#0b5394",
    elevation: 3,
  },

  tabText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0b5394",
  },

  /* FORÇA O TEXTO A FICAR BRANCO NA ABA ATIVA */
  tabTextActive: {
    color: "#fff",
    fontWeight: "800",
  },

  /* =========================
     CABEÇALHO DE GRUPO
  ========================= */
  headerGrupo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0b5394",
    marginTop: 20,
    marginBottom: 6,
    paddingLeft: 4,
  },

  /* =========================
     CARD PREMIUM
  ========================= */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#e6ecf5",
  },

  cardRelatorio: {
    backgroundColor: "#f4f7ff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#dce4f5",
  },

  nome: {
    fontWeight: "800",
    fontSize: 17,
    color: "#0b5394",
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },

  situacao: {
    fontWeight: "700",
    marginTop: 8,
    fontSize: 14,
  },

  /* =========================
     BOTÃO FLUTUANTE PREMIUM
  ========================= */
  fab: {
    position: "absolute",
    right: 22,
    bottom: 22,
    backgroundColor: "#0b5394",
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  /* =========================
     BARRA DE BUSCA
  ========================= */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e6ef",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  searchInput: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 15,
    color: "#333",
  },

  /* =========================
     BOTÃO PDF
  ========================= */
  btnPdf: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  btnPdfText: {
    color: "#fff",
    fontWeight: "800",
    marginLeft: 8,
    fontSize: 15,
  },

  /* =========================
     MODAL LUXO
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
    borderRadius: 20,
    padding: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
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
    backgroundColor: "#f3f5fa",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: "#111",
    borderWidth: 1,
    borderColor: "#dde3ee",
  },

  modalBtn: {
    backgroundColor: "#0b5394",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "800",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b5394",
    width: "80%",
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: "center",
    gap: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  selectCardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
