"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { clearSession, getSessionUser, getToken } from "../services/session"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    async function load() {
      const token = getToken()
      const sessionUser = getSessionUser()
      if (!token || !sessionUser) {
        setStatus("unauthenticated")
        return
      }
      setUser(sessionUser)
      setStatus("authenticated")
    }
    load()
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  function logout() {
    clearSession()
    setStatus("unauthenticated")
    router.replace("/login")
  }

  return { user, status, logout }
}