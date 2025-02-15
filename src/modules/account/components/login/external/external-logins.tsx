import ErrorMessage from "@modules/checkout/components/error-message"
import { redirect } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { ExternalAuthProvider } from "./external-auth-provider"
import { ExternalLoginButton } from "./external-login-button"
import { externalLogin } from "@lib/data/external-auth"

const ExternalLogins = () => {
  const [state, formAction, isPending] = useActionState(externalLogin, null)
  const [selectedProvider, setSelectedProvider] =
    useState<ExternalAuthProvider | null>(null)

  useEffect(() => {
    if (state && typeof state === "object") redirect(state.location)
  }, [state])

  useEffect(() => {
    if (!isPending) setSelectedProvider(null)
  }, [isPending])

  function handleClick(provider: ExternalAuthProvider) {
    setSelectedProvider(provider)
    formAction(provider)
  }

  return (
    <div className="w-full">
      <ErrorMessage
        error={(state && typeof state === "string" && state) || null}
      />

      <ExternalLoginButton
        provider={ExternalAuthProvider.Google}
        selectedProvider={selectedProvider}
        onClick={handleClick}
        disabled={isPending}
      >
        Login with Google
      </ExternalLoginButton>
    </div>
  )
}

export default ExternalLogins
