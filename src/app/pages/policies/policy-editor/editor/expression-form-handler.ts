import {Injectable} from '@angular/core';
import {PolicyExpressionMapped} from '../../../../shared/models/policy/policy-expression-mapped';
import {PolicyMapper} from '../../../../shared/models/policy/policy-mapper';
import {PolicyMultiExpressionConfig} from '../../../../shared/models/policy/policy-multi-expressions';
import {SUPPORTED_POLICY_OPERATORS} from '../../../../shared/models/policy/policy-operators';
import {PolicyVerbConfig} from '../../../../shared/models/policy/policy-verbs';
import {ExpressionFormControls} from './expression-form-controls';
import {ExpressionFormValue} from './expression-form-value';
import {Tree, TreeGeneratorFn, TreeNode} from './tree';
import { UiPolicyExpression } from '../../../../shared/models/policy/ui-policy-expression';

/**
 * Central service for interacting with the policy expression form.
 *
 * Must be provided at the component level as viewProvider.
 */
@Injectable()
export class ExpressionFormHandler {
  tree: Tree<ExpressionFormValue> = this.buildTree({type: 'EMPTY'});

  constructor(
    public controls: ExpressionFormControls,
    public policyMapper: PolicyMapper,
  ) {}

  private buildTree(
    expression: PolicyExpressionMapped,
  ): Tree<ExpressionFormValue> {
    return Tree.ofTreeLikeStructure<
      PolicyExpressionMapped,
      ExpressionFormValue
    >({
      root: expression,
      generatorFn: this.treeGenerator(),
    });
  }

  addConstraint(path: string[], verb: PolicyVerbConfig) {
    const expression: UiPolicyExpression = {
      type: 'CONSTRAINT',
      constraint: {
        left: verb.operandLeftId,
        ...verb.adapter.emptyConstraintValue(),
      },
    };

    this.addExpression(path, expression);
  }

  addMultiExpression(
    path: string[],
    multiExpression: PolicyMultiExpressionConfig,
  ) {
    const expression: UiPolicyExpression = {
      type: multiExpression.expressionType,
      expressions: [],
    };
    this.addExpression(path, expression);
  }

  addExpression(path: string[], expression: UiPolicyExpression) {
    const mapped = this.policyMapper.buildPolicy(expression);
    this.addTree(path, mapped);
  }

  removeNode(node: TreeNode<ExpressionFormValue>) {
    this.controls.unregisterControls(node);
    if (node.path.length === 1) {
      this.tree.replaceTree(node.path, {type: 'EMPTY'}, this.treeGenerator());
    } else {
      this.tree.remove(node.path);
    }
  }

  private addTree(
    path: string[],
    expression: PolicyExpressionMapped,
  ): TreeNode<ExpressionFormValue> {
    if (path.length === 1 && this.tree.root.value.type === 'EMPTY') {
      this.tree.replaceTree(path, expression, this.treeGenerator());
      return this.tree.root;
    } else {
      return this.tree.pushTree(path, expression, this.treeGenerator());
    }
  }

  private treeGenerator(): TreeGeneratorFn<
    PolicyExpressionMapped,
    ExpressionFormValue
  > {
    // Function returning a function for it to be available in the constructor
    return (expr, nodeId) => {
      const value = this.buildExpressionFormValue(expr);

      // Also create form controls as necessary
      this.controls.registerControls(
        nodeId,
        value,
        expr.operator?.id!,
        expr.valueRaw!,
      );

      return {value, children: expr.expressions ?? []};
    };
  }

  private buildExpressionFormValue(
    original: PolicyExpressionMapped,
  ): ExpressionFormValue {
    const supportedOperators = SUPPORTED_POLICY_OPERATORS.filter((it) =>
      original.verb?.supportedOperators.includes(it.id),
    );
    return {
      type: original.type,
      multiExpression: original.multiExpression,
      verb: original.verb,
      supportedOperators,
    };
  }

  toUiPolicyExpression() {
    const visit = (node: TreeNode<ExpressionFormValue>): UiPolicyExpression => {
      const value = node.value;
      if (value.type === 'EMPTY') {
        return {type: 'EMPTY'};
      } else if (value.type === 'MULTI') {
        return {
          type: value.multiExpression!.expressionType,
          expressions: node.children.map((it) => visit(it)),
        };
      } else {
        return {
          type: 'CONSTRAINT',
          constraint: {
            left: value.verb!.operandLeftId,
            operator: this.controls.getOperator(node).id,
            right: this.controls.getValue(node),
          },
        };
      }
    };

    return visit(this.tree.root);
  }

  reset(){
    this.tree = this.buildTree({type: 'EMPTY'});
  }
}
