/**
 * @remarks CheckZEP is legacy option for KEP predecessor (ZEP), it is not enforced, so we decided to keep it as `false`.
 * There is no option for KEP although in formulare.slovensko.sk "Pre odoslanie podania je vyžadovaný podpis KEP" is displayed.
 */
export const attachementsPospXml = `<?xml version="1.0" encoding="UTF-8"?>
<posp>
  <fields>
    <field>
      <id>CheckZEP</id>
      <value>false</value>
    </field>
    <field>
      <id>PaymentOrder</id>
      <value>false</value>
    </field>
    <field>
      <id>Delivery</id>
      <value>false</value>
    </field>
  </fields>
  <orchestration><id>1</id></orchestration>
</posp>
`
