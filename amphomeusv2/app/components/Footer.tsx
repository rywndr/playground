export default function Footer() {
  return (
    <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 mt-auto">
      <p>&copy; {new Date().getFullYear()} Amphomeus. All rights reserved.</p>
    </footer>
  );
}
