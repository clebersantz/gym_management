# models/membership_contract.py

from odoo import api, fields, models
from dateutil.relativedelta import relativedelta

class AccountMove(models.Model):
    _inherit = 'account.move'

    @api.model
    def _membership_product_ids(self):
        return self.env['product.product'].search([('membership', '=', True)]).ids

    def action_post(self):
        res = super().action_post()
        for move in self:
            if move.move_type == 'out_invoice':
                move._create_membership_lines_from_invoice()
        return res

    def _create_membership_lines_from_invoice(self):
        for move in self:
            for line in move.invoice_line_ids:
                if line.product_id.membership:
                    duration = 1
                    period = 'year'
                    if line.contract_line_id and line.contract_line_id.recurring_rule_type:
                        period = line.contract_line_id.recurring_rule_type
                        duration = line.contract_line_id.recurring_interval

                    date_from = move.invoice_date or fields.Date.today()
                    date_to = date_from + relativedelta(**{f"{period}s": duration})

                    self.env['membership.membership_line'].create({
                        'partner': move.partner_id.id,
                        'membership_id': line.product_id.id,
                        'date_from': date_from,
                        'date_to': date_to,
                        'account_invoice_id': move.id,
                    })