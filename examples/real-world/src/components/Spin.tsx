import React from "react";

export default ({ loading }: any) => {
  return loading ? <span className='loading'></span> : null
}
