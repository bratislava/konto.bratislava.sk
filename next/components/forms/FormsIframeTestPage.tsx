/* eslint-disable jsx-a11y/anchor-is-valid */
import IframeResizer from '@iframe-resizer/react'
import { useQueryState } from 'nuqs'
import React, { useEffect } from 'react'

import { ROUTES } from '../../frontend/api/constants'
import SelectField from './widget-components/SelectField/SelectField'

export type FormsIframeTestPageProps = {
  embeddedForms: {
    title: string
    slug: string
  }[]
}

/**
 * Test page with a faux layout for testing IframeResizer without needing to run 2 applications at once in development.
 */
const FormsIframeTestPage = ({ embeddedForms }: FormsIframeTestPageProps) => {
  const [selectedSlug, setSelectedSlug] = useQueryState('slug', {
    defaultValue: embeddedForms[0].slug,
    clearOnDefault: false,
  })
  useEffect(() => {
    // Initially if the query param is not present this sets it (`currentStepIndex` already contains default value)
    // https://github.com/47ng/nuqs/issues/405
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setSelectedSlug(selectedSlug, { history: 'replace' })
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const options = embeddedForms.map(({ title, slug }) => ({
    label: title,
    value: slug,
  }))

  const iframeUrl = `${ROUTES.MUNICIPAL_SERVICES_FORM(selectedSlug)}?externa-sluzba=true`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-(--breakpoint-xl) items-center justify-between p-4 lg:px-8">
          <a href="#" className="font-semibold text-black">
            LOGO
          </a>

          <nav className="hidden gap-6 lg:flex">
            <a href="#" className="font-semibold">
              Hlavná stránka
            </a>
            <a href="#" className="font-semibold">
              Informácie
            </a>
            <a href="#" className="font-semibold">
              Kontakt
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-6 lg:px-8">
          <h1 className="mb-6 text-h1 font-semibold">Formuláre</h1>

          <SelectField
            options={options}
            value={options.find((option) => option.value === selectedSlug)}
            onChange={(option) => setSelectedSlug(option?.value ?? options[0].value)}
            label="Zvoliť formulár"
            className="mb-4"
          />

          <IframeResizer
            key={selectedSlug}
            license="GPLv3"
            src={iframeUrl}
            style={{ width: '100%', height: '100vh' }}
          />
        </div>
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <div className="mb-4 font-semibold">LOGO</div>
              <p>
                Názov spoločnosti
                <br />
                Ulica 123
                <br />
                851 01 Bratislava
                <br />
                info@example.sk
              </p>
            </div>

            <div>
              <h5 className="mb-4 font-semibold">Menu</h5>
              <div className="flex flex-col gap-2">
                <a href="#" className="hover:underline">
                  Prvá položka
                </a>
                <a href="#" className="hover:underline">
                  Druhá položka
                </a>
                <a href="#" className="hover:underline">
                  Tretia položka
                </a>
                <a href="#" className="hover:underline">
                  Štvrtá položka
                </a>
              </div>
            </div>

            <div>
              <h5 className="mb-4 font-semibold">Dokumenty</h5>
              <div className="flex flex-col gap-2">
                <a href="#" className="hover:underline">
                  Dokument 1
                </a>
                <a href="#" className="hover:underline">
                  Dokument 2
                </a>
                <a href="#" className="hover:underline">
                  Dokument 3
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FormsIframeTestPage
