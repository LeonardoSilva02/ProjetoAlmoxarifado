import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f7fc",
    paddingBottom: 40,
    minHeight: '100%',
  },

  header: {
    paddingVertical: 32,
    alignItems: "center",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    elevation: 10,
    shadowColor: "#0b5394",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 6,
  },

  logo: {
    width: 140,
    height: 60,
    marginBottom: 2,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 8,
    textShadowColor: '#0008',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  subTitle: {
    color: "#dbe7ff",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "700",
    letterSpacing: 0.5,
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* ✅ KPI AREA */
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -25,
    paddingHorizontal: 12,
  },

  kpiCard: {
    backgroundColor: "#fff",
    width: "30%",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 6,
  },

  kpiValue: {
    fontWeight: "800",
    color: "#0b5394",
    marginTop: 6,
  },

  kpiLabel: {
    fontSize: 12,
    color: "#666",
  },

  sectionTitleWrap: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0b5394",
    letterSpacing: 0.7,
    textAlign: 'center',
    textShadowColor: '#fff8',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 6,
    marginBottom: 18,
  },

  card: {
    width: '90%',
    maxWidth: 340,
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 22,
    marginVertical: 10,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#0b5394",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'center',
    transition: 'transform 0.15s',
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e7eef9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#b6d0f7',
    shadowColor: '#0b5394',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },

  cardText: {
    textAlign: "center",
    color: "#0b5394",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 4,
    marginTop: 6,
    letterSpacing: 0.2,
    textShadowColor: '#b6d0f7',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#ff4d4d",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: '#b00020',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  logoutText: {
    color: "#fff",
    fontWeight: "900",
    marginLeft: 12,
    fontSize: 17,
    letterSpacing: 0.5,
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
