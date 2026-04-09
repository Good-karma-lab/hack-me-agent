type AuthFormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
};

export function AuthFormField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: AuthFormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-[18px] border border-white/10 bg-[#07101c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/35 focus:bg-[#091525]"
      />
    </label>
  );
}
