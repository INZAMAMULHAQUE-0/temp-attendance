export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        mist: "#eef3f7",
        teal: "#0f766e",
        coral: "#e85d4f"
      },
      boxShadow: {
        panel: "0 10px 35px rgba(24,33,47,.08)"
      }
    }
  },
  plugins: []
};
