"use client"

import { Button } from "@medusajs/ui"
import React from "react"
import { ExternalAuthProvider } from "./external-auth-provider"

export function ExternalLoginButton({
  children,
  provider,
  selectedProvider,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  provider: ExternalAuthProvider
  selectedProvider: ExternalAuthProvider | null
  onClick: (provider: ExternalAuthProvider) => void
  disabled: boolean
}) {
  return (
    <Button
      size="large"
      variant="secondary"
      type="button"
      className="w-full mt-6"
      onClick={() => onClick(provider)}
      isLoading={selectedProvider == provider}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
