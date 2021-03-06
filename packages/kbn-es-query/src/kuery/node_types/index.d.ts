/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * WARNING: these typings are incomplete
 */

import { JsonObject, JsonValue } from '..';

type FunctionName =
  | 'is'
  | 'and'
  | 'or'
  | 'not'
  | 'range'
  | 'exists'
  | 'geoBoundingBox'
  | 'geoPolygon';

interface FunctionTypeBuildNode {
  type: 'function';
  function: FunctionName;
  // TODO -> Need to define a better type for DSL query
  arguments: any[];
}

interface FunctionType {
  buildNode: (functionName: FunctionName, ...args: any[]) => FunctionTypeBuildNode;
  buildNodeWithArgumentNodes: (functionName: FunctionName, ...args: any[]) => FunctionTypeBuildNode;
  toElasticsearchQuery: (node: any, indexPattern: any, config: JsonObject) => JsonValue;
}

interface LiteralType {
  buildNode: (
    value: null | boolean | number | string
  ) => { type: 'literal'; value: null | boolean | number | string };
  toElasticsearchQuery: (node: any) => null | boolean | number | string;
}

interface NamedArgType {
  buildNode: (name: string, value: any) => { type: 'namedArg'; name: string; value: any };
  toElasticsearchQuery: (node: any) => string;
}

interface WildcardType {
  buildNode: (value: string) => { type: 'wildcard'; value: string };
  test: (node: any, string: string) => boolean;
  toElasticsearchQuery: (node: any) => string;
  toQueryStringQuery: (node: any) => string;
  hasLeadingWildcard: (node: any) => boolean;
}

interface NodeTypes {
  function: FunctionType;
  literal: LiteralType;
  namedArg: NamedArgType;
  wildcard: WildcardType;
}

export const nodeTypes: NodeTypes;
