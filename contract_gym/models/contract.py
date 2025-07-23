from odoo import api, fields, models, _

class ContractContract(models.Model):
    _inherit = 'contract.contract'

    name = fields.Char(
        string=_('Contract Number'),
        required=False,
        copy=False,
        readonly=True,
    )

    period_number = fields.Integer(
        string=_('Number of Periods'),
        default=1,
        help=_('Número de períodos de duração do contrato'),
    )

    period_type = fields.Selection(
        string=_('Period Type'),
        selection=[
            ('monthly', _('Monthly')),
            ('weekly', _('Weekly')),
            ('yearly', _('Yearly')),
        ],
        default='monthly',
        help=_('Tipo de período do contrato'),
    )


    @api.model
    def create(self, vals_list):
        # Garante que estamos lidando com uma lista de dicionários
        if isinstance(vals_list, dict):
            vals_list = [vals_list]

        for vals in vals_list:
            if not vals.get('name'):
                vals['name'] = self.env['ir.sequence'].next_by_code('contract.contract.gym')

        records = super().create(vals_list)
        return records