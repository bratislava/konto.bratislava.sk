import { Button, Typography } from '@bratislava/component-library'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import FormatDate from '@/src/components/formatting/FormatDate'
import Icon from '@/src/components/icon-components/Icon'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import { MyApplicationFormData } from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetails/MyApplicationDetails'
import { useExportFormToPdf } from '@/src/frontend/hooks/useExportFormToPdf'

type Props = {
  formDefinitionTitle: string
  myApplicationFormData?: MyApplicationFormData
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationDetailsHeader = ({ formDefinitionTitle, myApplicationFormData }: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { exportFormToPdf } = useExportFormToPdf()

  const subject = myApplicationFormData?.formSubject
  const sentAt = myApplicationFormData?.formSentAt

  return (
    <SectionContainer className="bg-background-passive-primary pb-4 lg:pb-10">
      <div className="py-3 lg:py-6">
        <Button
          variant="link"
          startIcon={<Icon name="chevron-left" />}
          onPress={() => router.back()}
        >
          {t('MyApplicationDetailsHeader.backToList')}
        </Button>
      </div>
      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-3">
          <Typography variant="h1">{subject ?? formDefinitionTitle}</Typography>
          <div className="flex gap-3">
            <Typography variant="p-small">{t('MyApplicationDetailsHeader.sentDate')}</Typography>
            {sentAt ? (
              <Typography variant="p-small" className="font-semibold">
                <FormatDate>{sentAt}</FormatDate>
              </Typography>
            ) : null}
          </div>
        </div>
        {myApplicationFormData ? (
          <Button
            variant="solid"
            fullWidthMobile
            startIcon={<Icon name="download" />}
            onPress={() =>
              exportFormToPdf({
                formId: myApplicationFormData.id,
                formSlug: myApplicationFormData.formDefinitionSlug,
              })
            }
          >
            {t('MyApplicationDetailsHeader.downloadPdf')}
          </Button>
        ) : null}
      </div>
    </SectionContainer>
  )
}

export default MyApplicationDetailsHeader
