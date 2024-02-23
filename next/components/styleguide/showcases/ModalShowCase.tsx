import CorrespondenceAddressModal from 'components/forms/segments/CorrespondenceAddressModal/CorrespondenceAddressModal'
// import IdentityVerificationModal from 'components/forms/segments/IdentityVerificationModal/IdentityVerificationModal'
import { PhoneNumberData } from 'components/forms/segments/PhoneNumberForm/PhoneNumberForm'
import RegistrationModal, {
  RegistrationModalType,
} from 'components/forms/segments/RegistrationModal/RegistrationModal'
// import RegistrationModal, {
//   RegistrationModalType,
// } from 'components/forms/segments/RegistrationModal/RegistrationModal'
import Modal from 'components/forms/widget-components/Modals/Modal'
import { Address } from 'frontend/dtos/accountDto'
import { useState } from 'react'

import PhoneNumberModal from '../../forms/segments/PhoneNumberModal/PhoneNumberModal'
import Button from '../../forms/simple-components/Button'
import ButtonNew from '../../forms/simple-components/ButtonNew'
import MessageModal from '../../forms/widget-components/Modals/MessageModal'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const firstScreen = () => {
  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-[blue] p-2 text-white">
      First screen
    </div>
  )
}

const secondScreen = () => {
  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-[orange] p-2 text-white">
      Second screen
    </div>
  )
}

const thirdScreen = () => {
  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-[purple] p-2 text-white">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
      been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
      took a galley of type and scrambled it to make a type specimen book. It has survived not only
      five centuries, but also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
      Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
      including versions of Lorem Ipsum.
    </div>
  )
}

const singleModalContent = ({ onSubmit }: any) => {
  return (
    <div>
      <div className="flex w-full items-center justify-center rounded-lg bg-[green] p-2 text-white">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
        took a galley of type and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting, remaining essentially
        unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum.
      </div>
      <div className="mt-2 flex justify-between">
        <Button text="First" variant="black-outline" onPress={onSubmit} />
        <Button text="Second" variant="black-outline" onPress={onSubmit} />
      </div>
    </div>
  )
}

const ModalShowCase = () => {
  const [modalSingleShow, setModalSingleShow] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [messageModal, setMessageModal] = useState(false)
  const [correnspondenceAddressModalShow, setCorrenspondenceAddressModalShow] = useState(false)
  const [addressModalData, setAddressModalData] = useState<any>({
    street_address: 'Stef 12',
    locality: 'Bratislava',
    postal_code: '05801',
  })
  const [phoneNumberModalShow, setPhoneNumberModalShow] = useState(false)
  const [phoneNumberModalData, setPhoneNumberModalData] = useState<string | undefined>(
    '+421999999999',
  )
  const [registrationModal, setRegistrationModal] = useState(false)
  // TODO either remove these modals from showcase completely, or fix their dependency on useFormRedirects
  // const [identityVerificationModal, setIdentityVerificationModal] = useState(false)

  const onSubmitCorrespondenceAddress = ({ data }: { data?: Address }) => {
    setAddressModalData(data)
    setCorrenspondenceAddressModalShow(false)
  }

  const onSubmitPhoneNumber = async ({ data }: { data?: PhoneNumberData }) => {
    setPhoneNumberModalData(data?.phone_number)
    setPhoneNumberModalShow(false)
  }

  return (
    <Wrapper direction="column" title="Modal">
      <Stack direction="column">
        <Button
          size="sm"
          variant="black"
          text="Open modal single content modal window"
          onPress={() => setModalSingleShow(true)}
        />
        <Button
          size="sm"
          variant="black-outline"
          text="Open modal (divider is optional parameter)"
          onPress={() => setModalShow(true)}
        />
        <Button
          size="sm"
          variant="black"
          text="Open message modal"
          onPress={() => setMessageModal(true)}
        />
        <Button
          size="sm"
          variant="black"
          text="Open correspondence address modal"
          onPress={() => setCorrenspondenceAddressModalShow(true)}
        />
        <Button
          size="sm"
          variant="black"
          text="Open phone number modal"
          onPress={() => setPhoneNumberModalShow(true)}
        />
        {/* <Button
          size="sm"
          variant="black"
          text="Open registration modal"
          onPress={() => setRegistrationModal(true)}
        />
        <Button
          size="sm"
          variant="black"
          text="Open Identity Verification Modal"
          onPress={() => setIdentityVerificationModal(true)}
        /> */}
        <Modal
          divider
          header="Some header"
          show={modalSingleShow}
          onClose={() => setModalSingleShow(false)}
          onSubmit={() => {
            alert('Modal submitted')
            setModalSingleShow(false)
          }}
          content={singleModalContent}
          className="w-[700px]"
          confirmLabel="Finish"
          cancelLabel="Zrušit"
        />
        <Modal
          divider
          header="Some header"
          show={modalShow}
          onClose={() => setModalShow(false)}
          onSubmit={() => {
            alert('Modal submitted')
            setModalShow(false)
          }}
          content={[firstScreen, secondScreen, thirdScreen]}
          className="w-[700px]"
          confirmLabel="Finish"
          cancelLabel="Zrušit"
        />

        <MessageModal
          type="success"
          isOpen={messageModal}
          onOpenChange={setMessageModal}
          title="Lorem ipsum"
          buttons={[<ButtonNew variant="black-plain">Test button</ButtonNew>]}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </MessageModal>

        <CorrespondenceAddressModal
          show={correnspondenceAddressModalShow}
          onClose={() => setCorrenspondenceAddressModalShow(false)}
          onSubmit={onSubmitCorrespondenceAddress}
          defaultValues={addressModalData}
        />
        <PhoneNumberModal
          show={phoneNumberModalShow}
          onClose={() => setPhoneNumberModalShow(false)}
          onSubmit={onSubmitPhoneNumber}
          defaultValues={{ phone_number: phoneNumberModalData }}
        />
        <RegistrationModal
          type={RegistrationModalType.Initial}
          isOpen={registrationModal}
          onOpenChange={setRegistrationModal}
          login={() => {}}
          register={() => {}}
        />
        {/* <IdentityVerificationModal
          isOpen={identityVerificationModal}
          onOpenChange={setIdentityVerificationModal}
          accountType={AccountType.FyzickaOsoba}
        /> */}
      </Stack>
    </Wrapper>
  )
}

export default ModalShowCase
