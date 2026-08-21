import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import FormatDate from '@/src/components/formatting/FormatDate'
import Icon from '@/src/components/icon-components/Icon'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import useExportFormPdf from '@/src/components/page-contents/MyApplicationsPageContent/useExportFormPdf'
import Breadcrumbs from '@/src/components/segments/Breadcrumbs/Breadcrumbs'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  formDefinitionTitle: string
  myApplicationFormData?: GetFormResponseDto
  myApplicationGinisData?: GinisDocumentDetailResponseDto | null
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationDetailsHeader = ({
  formDefinitionTitle,
  myApplicationFormData,
  myApplicationGinisData,
}: Props) => {
  const { t } = useTranslation()
  const exportFormPdf = useExportFormPdf({ myApplicationFormData })

  const firstGinisChangeDate =
    myApplicationGinisData?.documentHistory?.[
      (myApplicationGinisData?.documentHistory?.length || 0) - 1
    ]?.['Datum-zmeny']

  const subject = myApplicationFormData?.formSubject
  const createdAt = firstGinisChangeDate || myApplicationFormData?.createdAt

  const breadcrumbs = [
    { title: t('MyApplicationsPageContent.title'), path: ROUTES.MY_APPLICATIONS },
    { title: subject ?? formDefinitionTitle, path: null },
  ]

  return (
    <SectionContainer className="bg-background-passive-primary pb-4 lg:pb-10">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-3">
          <Typography variant="h1">{subject}</Typography>
          <div className="flex gap-3">
            <Typography variant="p-small">{t('MyApplicationDetailsHeader.sentDate')}</Typography>
            {createdAt ? (
              <Typography variant="p-small" className="font-semibold">
                <FormatDate>{createdAt}</FormatDate>
              </Typography>
            ) : null}
          </div>
        </div>
        {exportFormPdf ? (
          <Button
            variant="solid"
            fullWidthMobile
            startIcon={<Icon name="download" />}
            onPress={exportFormPdf}
          >
            {t('MyApplicationDetailsHeader.downloadPdf')}
          </Button>
        ) : null}
      </div>
    </SectionContainer>
  )
}

export default MyApplicationDetailsHeader
