import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },

  header: {
    backgroundColor: "#0b5394",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 12,
  },

  tabContainer: {
    flex: 1,
    padding: 14,
    backgroundColor: "#f4f7fc",
  },

  searchRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: 48,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 14,
    elevation: 4,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },

  itemName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#0b5394",
  },

  itemQtd: {
    fontWeight: "800",
    fontSize: 15,
    color: "#1b9e77",
  },

  formBox: {
    backgroundColor: "#f4f7fc",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
  },

  label: {
    fontWeight: "700",
    marginTop: 14,
    color: "#333",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
  },

  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  typeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#e5e9f2",
    alignItems: "center",
    marginHorizontal: 4,
  },

  typeBtnActive: {
    backgroundColor: "#0b5394",
  },

  typeText: {
    fontWeight: "800",
    color: "#fff",
  },

  selectedItem: {
    backgroundColor: "#e2edff",
    color: "#0b5394",
    padding: 14,
    borderRadius: 14,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },

  saveBtn: {
    backgroundColor: "#0b5394",
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  saveText: {
    color: "#fff",
    fontWeight: "800",
    marginLeft: 8,
    fontSize: 16,
  },

  selectWrap: {
    flex: 1,
    backgroundColor: "#f4f7fc",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  selectTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0b5394",
    marginBottom: 30,
    textAlign: "center",
  },

  selectBtn: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0b5394",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  selectBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },
});
