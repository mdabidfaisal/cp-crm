export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
