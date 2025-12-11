import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f7fc",
    paddingBottom: 40,
  },

  header: {
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },

  logo: {
    width: 180,
    height: 80,
    marginBottom: 6,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  subTitle: {
    color: "#dbe7ff",
    fontSize: 14,
    marginTop: 4,
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
    marginTop: 30,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0b5394",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 14,
  },

  card: {
    width: "44%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 26,
    marginVertical: 12,
    alignItems: "center",
    elevation: 6,
  },

  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: "#e7eef9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  cardText: {
    textAlign: "center",
    color: "#0b5394",
    fontSize: 14.5,
    fontWeight: "800",
    paddingHorizontal: 4,
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#ff4d4d",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 60,
    marginTop: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
});
