/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FF4500',
        border: '#E0E0E0',
        error: '#EF4444',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          placeholder: '#9CA3AF'
        },
        background: {
          gray: '#F5F5F5',
          light: '#F9FAFB'
        }
      }
    }
  },
  plugins: []
}
