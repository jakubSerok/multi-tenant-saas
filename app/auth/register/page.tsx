"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
      const router = useRouter();

      const [form,setForm] = useState({
        name:"",
        email:"",
        password:"",
        companyName: ""
        
      })

      const [loading,setLoading] = useState(false)
     const [error,setError] = useState("")

     const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setForm((prev)=>({
            ...prev,
            [e.target.name]:e.target.value
        }))
     }
     const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try{
            const res = await fetch("/api/register",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(form)
            })
            if(!res.ok){
                throw new Error("Failed to register user")
            }
            router.push("/auth/login")
        }
        catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
     }
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold text-center">Create Account</h1>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Company Name</label>
          <input
            type="text"
            name="companyName"
            required
            value={form.companyName}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
    );
};
