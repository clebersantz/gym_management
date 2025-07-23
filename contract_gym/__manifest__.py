{
    'name': 'Gym Contract',
    'version': '16.0.1.0.0',
    'summary': 'Gym Contract Management',
    'author': 'SANTZ IT',
    'license': 'AGPL-3',
    'category': 'Contracts',
    'depends': ['contract'],  # OCA contract como pré-requisito
    'data': [
        'data/gym_contract_sequence.xml',
        'views/contract.xml',
    ],
    # 'demo': [
        # 'data/gym_contract_demo.xml',
    # ],
    'installable': True,
    'auto_install': False,
}
