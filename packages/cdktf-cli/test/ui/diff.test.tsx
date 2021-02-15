import React from "react";
import { render } from "ink-testing-library";
import { Plan } from "../../bin/cmds/ui/diff";
import {
  PlannedResource,
  PlannedResourceAction
} from "../../bin/cmds/ui/models/terraform";
import {
  TerraformProvider,
  DeployState,
  Status
} from "../../bin/cmds/ui/terraform-context";

test("Diff", async () => {
  const resource: PlannedResource = {
    id: "foo.bar_352350",
    action: PlannedResourceAction.CREATE
  };

  const initialState: DeployState = {
    status: Status.STARTING,
    stackName: "testing",
    resources: [],
    plan: {
      needsApply: true,
      applyableResources: [resource],
      planFile: "",
      resources: [resource]
    }
  };

  const { lastFrame } = render(
    <TerraformProvider initialState={initialState}>
      <Plan />
    </TerraformProvider>
  );
  expect(stripAnsi(lastFrame())).toMatchInlineSnapshot(`
    "Stack: testing
    Resources
     + FOO                  bar_352350          foo.bar_352350

    Diff: 1 to create, 0 to update, 0 to delete."
  `);
});

test("Diff no Changes", async () => {
  const initialState: DeployState = {
    status: Status.STARTING,
    stackName: "testing",
    resources: [],
    plan: {
      needsApply: false,
      applyableResources: [],
      planFile: "",
      resources: []
    }
  };

  const { lastFrame } = render(
    <TerraformProvider initialState={initialState}>
      <Plan />
    </TerraformProvider>
  );
  expect(stripAnsi(lastFrame())).toMatchInlineSnapshot(`
    "Stack: testing

    Diff: 0 to create, 0 to update, 0 to delete."
  `);
});

test("Diff with Cloud URL", async () => {
  const initialState: DeployState = {
    status: Status.STARTING,
    stackName: "testing",
    resources: [],
    url: "https://app.terraform.io/foo/bar",
    plan: {
      needsApply: false,
      applyableResources: [],
      planFile: "",
      resources: []
    }
  };

  const { lastFrame } = render(
    <TerraformProvider initialState={initialState}>
      <Plan />
    </TerraformProvider>
  );
  expect(stripAnsi(lastFrame())).toMatchInlineSnapshot(`
    "Running plan in the remote backend. To view this run in a browser, visit:
    https://app.terraform.io/foo/bar
    Stack: testing

    Diff: 0 to create, 0 to update, 0 to delete."
  `);
});

test("Diff Multiple Resources", async () => {
  const resource: PlannedResource = {
    id: "null_resource.hellodiff_test_15E428D2",
    action: PlannedResourceAction.CREATE
  };

  const otherResource: PlannedResource = {
    id: "null_resource.hellodiff_test_85E428D7",
    action: PlannedResourceAction.CREATE
  };

  const initialState: DeployState = {
    status: Status.STARTING,
    stackName: "testing",
    resources: [],
    plan: {
      needsApply: true,
      applyableResources: [resource, otherResource],
      planFile: "",
      resources: [resource, otherResource]
    }
  };

  const { lastFrame } = render(
    <TerraformProvider initialState={initialState}>
      <Plan />
    </TerraformProvider>
  );
  expect(stripAnsi(lastFrame())).toMatchInlineSnapshot(`
    "Stack: testing
    Resources
     + NULL_RESOURCE        hellodiff_test      null_resource.hellodiff_test_15E428D2
     + NULL_RESOURCE        hellodiff_test      null_resource.hellodiff_test_85E428D7

    Diff: 2 to create, 0 to update, 0 to delete."
  `);
});

const stripAnsi = (str: string | undefined): string => {
  if (!str) {
    return "";
  }
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
};
