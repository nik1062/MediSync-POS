'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feature_flags'); // Drop legacy if exists

    await queryInterface.createTable('feature_flags', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      plan: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      featureKey: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    });

    await queryInterface.addIndex('feature_flags', ['plan', 'featureKey'], {
      unique: true,
      name: 'feature_flags_plan_featureKey'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feature_flags');
  },
};
