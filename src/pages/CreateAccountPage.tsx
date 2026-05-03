import { Link } from 'react-router'
import createAccountData from '@/data/create-account.json'

export default function CreateAccountPage() {
  const { form } = createAccountData

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-2">{form.title}</h1>
        
        <form className="space-y-4 mt-6">
          {form.fields.map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {field.showToggle && (
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Password Requirements */}
          <div className="space-y-1">
            {form.passwordRequirements.map((req, i) => (
              <p key={i} className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                {req.label}
              </p>
            ))}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium mb-1">{form.dateOfBirth.label}</label>
            <input
              type="text"
              placeholder={form.dateOfBirth.placeholder}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-gray-400 mt-1">{form.dateOfBirth.hint}</p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">{form.gender.label}</label>
            <div className="flex gap-3">
              {form.gender.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="gender" value={opt.value} className="accent-black" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{form.gender.hint}</p>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-sm font-medium mb-2">{form.newsletter.title}</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              {form.newsletter.label}
            </label>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="rounded mt-0.5" />
            <span>
              {form.terms.label}{' '}
              <Link to={form.terms.linkHref} className="underline">{form.terms.linkLabel}</Link>
            </span>
          </label>

          <button type="submit" className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            {form.submitButton}
          </button>
        </form>
        <Link to={form.loginLink.href} className="block text-center mt-4 text-sm text-gray-600 hover:text-black">
          {form.loginLink.label}
        </Link>
      </div>
    </main>
  )
}
