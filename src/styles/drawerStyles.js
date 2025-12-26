import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 8,
  },

  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  userEmail: {
    color: "#e0e0e0",
    fontSize: 12,
  },

  userRole: {
    color: "#c7d7f5",
    fontSize: 12,
    marginTop: 5,
  },

  drawerItems: {
    flex: 1,
    paddingHorizontal: 8,
  },

  separator: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginVertical: 8,
  },

  footer: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },

  logoutButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 12,
    height: 52,
    marginTop: 10,
    marginBottom: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: '#b00020',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  logoutLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },
});
