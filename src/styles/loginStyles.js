import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b5394",
  },

  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    width: 150,
    height: 95,
    borderRadius: 18,
  },

  appName: {
    fontSize: 19,
    color: "#e6f0ff",
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: 0.6,
  },

  card: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 420,
    borderRadius: 28,
    paddingVertical: 38,
    paddingHorizontal: 26,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0b5394",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 28,
    textAlign: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3f0",
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 60,
  },

  input: {
    flex: 1,
    fontSize: 17,
    paddingLeft: 10,
    color: "#0f172a",
  },

  buttonArea: {
    marginTop: 20,
    width: "100%",
  },

  buttonBase: {
    width: "100%",
    height: 72,
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },

  buttonPrimary: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  buttonSecondary: {
    backgroundColor: "#eaf2ff",
    borderWidth: 2,
    borderColor: "#0b5394",
  },

  secondaryText: {
    color: "#0b5394",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  footerText: {
    color: "#cfe0ff",
    fontSize: 13,
    marginTop: 30,
  },
});
